
class PrivateNetworkAccessMiddleware:
    """
    Middleware to handle Private Network Access (PNA) preflight requests.
    This allows a public website (HTTPS) to access a local network resource (HTTP).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # If this is a preflight request (OPTIONS), check for the PNA header
        if request.method == "OPTIONS" and "HTTP_ACCESS_CONTROL_REQUEST_PRIVATE_NETWORK" in request.META:
            response["Access-Control-Allow-Private-Network"] = "true"
            
        return response
