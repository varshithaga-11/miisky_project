import requests
import time
import json
import logging
import base64
import os
from django.conf import settings
from .models import UserDietPlan, UserRegister

# Use cryptography for JWS/JWE
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)

def base64url_encode(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

class HDFCJWEHelper:
    """
    Helper for HDFC SmartGateway JWS/JWE Encryption.
    Implements the two-step process:
    1. Sign (JWS - RS256) using Merchant Private Key.
    2. Encrypt (JWE - RSA-OAEP-256 + A256GCM) using Bank Public Key.
    """
    @staticmethod
    def encrypt(payload_dict, public_key_pem, private_key_pem, key_id):
        try:
            # --- STEP 1: Signing the Payload (JWS) ---
            # Construct JWS Header
            jws_header = {"alg": "RS256", "kid": key_id}
            jws_header_b64 = base64url_encode(json.dumps(jws_header))
            
            # Construct Payload
            payload_b64 = base64url_encode(json.dumps(payload_dict))
            
            # Generate Signature
            signing_input = f"{jws_header_b64}.{payload_b64}".encode('utf-8')
            private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
            signature = private_key.sign(
                signing_input,
                padding.PKCS1v15(), # RS256 uses PKCS1 v1.5
                hashes.SHA256()
            )
            signature_b64 = base64url_encode(signature)
            
            # Serialize JWS to JSON Format (Flattened)
            jws_json = {
                "header": jws_header_b64,
                "payload": payload_b64,
                "signature": signature_b64
            }
            jws_payload_str = json.dumps(jws_json)

            # --- STEP 2: Encrypting the Payload (JWE) ---
            # Construct JWE Header
            jwe_header = {
                "alg": "RSA-OAEP-256",
                "enc": "A256GCM",
                "kid": key_id,
                "cty": "JWT"
            }
            jwe_header_b64 = base64url_encode(json.dumps(jwe_header))
            
            # Generate random AES CEK (256-bit) and IV (96-bit)
            cek = AESGCM.generate_key(bit_length=256)
            iv = os.urandom(12)
            
            # Encrypt CEK with Bank's Public Key (RSA-OAEP-256)
            bank_public_key = serialization.load_pem_public_key(public_key_pem.encode())
            encrypted_key = bank_public_key.encrypt(
                cek,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Encrypt signed JWS with AES-GCM
            # Use JWE Protected Header as Aad
            aesgcm = AESGCM(cek)
            ciphertext_with_tag = aesgcm.encrypt(iv, jws_payload_str.encode('utf-8'), jwe_header_b64.encode('utf-8'))
            
            # Split tag (last 16 bytes) from ciphertext
            ciphertext = ciphertext_with_tag[:-16]
            tag = ciphertext_with_tag[-16:]
            
            # Step 3: Serialize to HDFC specific JSON format
            return {
                "header": jwe_header_b64,
                "encryptedKey": base64.b64encode(encrypted_key).decode('utf-8'),
                "iv": base64.b64encode(iv).decode('utf-8'),
                "encryptedPayload": base64.b64encode(ciphertext).decode('utf-8'),
                "tag": base64.b64encode(tag).decode('utf-8')
            }
        except Exception as e:
            logger.error(f"HDFC JWE Implementation Error: {str(e)}")
            raise e

    @staticmethod
    def generate_keys():
        """Helper to generate 2048 bit RSA Public Private Key pair."""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return private_pem.decode('utf-8'), public_pem.decode('utf-8')

class HDFCSmartGateway:
    SANDBOX_URL = "https://smartgateway.hdfcuat.bank.in/v4/session"
    PRODUCTION_URL = "https://smartgateway.hdfc.bank.in/v4/session"

    def __init__(self):
        self.is_sandbox = getattr(settings, 'HDFC_PAYMENT_SANDBOX', True)
        self.merchant_id = getattr(settings, 'HDFC_MERCHANT_ID', 'hdfcmaster')
        self.reseller_id = getattr(settings, 'HDFC_RESELLER_ID', 'hdfc_reseller')
        self.client_id = 'hdfcmaster' if self.is_sandbox else self.merchant_id
        self.return_url = getattr(settings, 'HDFC_RETURN_URL', 'https://api.miisky.com/api/userdietplan/payment_callback/')
        self.url = self.SANDBOX_URL if self.is_sandbox else self.PRODUCTION_URL
        self.api_key = getattr(settings, 'HDFC_API_KEY', '')
        self.public_key = getattr(settings, 'HDFC_PUBLIC_KEY', None)
        self.private_key = getattr(settings, 'HDFC_PRIVATE_KEY', None)
        self.key_id = getattr(settings, 'HDFC_KEY_ID', '')

    def _prepare_payload(self, body):
        """Encrypts payload using JWS + JWE if keys are available."""
        if self.public_key and self.private_key and self.key_id:
            logger.info("Encrypting HDFC payload using full JWS/JWE suite.")
            return HDFCJWEHelper.encrypt(body, self.public_key, self.private_key, self.key_id)
        return body

    def create_session(self, plan: UserDietPlan, user: UserRegister):
        """Creates a session in HDFC SmartGateway."""
        order_id = f"JP{int(time.time())}{str(plan.id)[-2:]}"
        amount_str = "{:.2f}".format(float(plan.diet_plan.final_amount if plan.diet_plan else 1.00))
        
        body = {
            "order_id": order_id,
            "amount": amount_str,
            "customer_id": f"CUST-{user.id}",
            "customer_email": user.email,
            "customer_phone": getattr(user, 'mobile', '9999999999')[-10:],
            "payment_page_client_id": self.client_id,
            "action": "paymentPage",
            "return_url": self.return_url,
            "first_name": user.first_name or "Guest",
            "last_name": user.last_name or "User",
            "description": f"Payment for {plan.diet_plan.title if plan.diet_plan else 'Plan'}",
            "currency": "INR",
            "udf1": str(plan.id),
            "udf2": str(user.id),
            "udf3": plan.diet_plan.code if plan.diet_plan else "N/A"
        }
        
        headers = self._get_headers(user.id)
        payload = self._prepare_payload(body)
        
        try:
            response = requests.post(self.url, json=payload, headers=headers, timeout=30)
            if response.status_code != 200:
                logger.error(f"HDFC Session Error: {response.status_code} - {response.text}")
                return {"error": True, "detail": f"Gateway Error: {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"HDFC Session Exception: {str(e)}")
            return {"error": True, "detail": str(e)}

    def get_order_status(self, order_id: str, customer_id: str):
        """Fetches the status of an order from HDFC SmartGateway."""
        status_url = self.url.replace('/session', '/order-status')
        body = {"order_id": order_id}
        
        headers = self._get_headers(customer_id.replace('CUST-', ''))
        payload = self._prepare_payload(body)
        
        try:
            response = requests.request("GET", status_url, json=payload, headers=headers, timeout=30)
            if response.status_code != 200:
                logger.error(f"HDFC Status Error: {response.status_code} - {response.text}")
                return {"error": True, "detail": f"Gateway Error: {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"HDFC Status Exception: {str(e)}")
            return {"error": True, "detail": str(e)}

    def _get_headers(self, user_id):
        headers = {
            "x-merchantid": self.merchant_id,
            "x-customerid": f"CUST-{user_id}",
            "x-resellerid": self.reseller_id,
            "Content-Type": "application/json"
        }
        if self.api_key:
            auth_str = f"{self.api_key}:"
            encoded_auth = base64.b64encode(auth_str.encode()).decode()
            headers["Authorization"] = f"Basic {encoded_auth}"
        return headers
