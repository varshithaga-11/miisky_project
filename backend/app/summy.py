
class DietPlans(models.Model):
    title = models.CharField(max_length=100)  # e.g. "Weight Loss Plan"
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)  # e.g. "WL001"

    amount = models.DecimalField(max_digits=10, decimal_places=2)  # e.g. 2000.00
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # e.g. 500.00

    no_of_days = models.IntegerField(null=True, blank=True)  # e.g. 30 days

    # Optional override for patient plan payment split (% of gross). If any is null, code defaults apply (15/15/60).
    platform_fee_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Override: platform share % of gross (must set all three to override)",
    )
    nutritionist_share_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )
    kitchen_share_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    @property
    def final_amount(self):
        # amount = 2000, discount = 500 → 1500
        if self.discount_amount:
            return max(self.amount - self.discount_amount, 0)
        return self.amount

    def __str__(self):
        return self.title




class UserDietPlan(models.Model):

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="diet_plans"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="suggested_diet_plans"
    )
    #previous nutritionist
    original_nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="originally_assigned_plans",
    )

    diet_plan = models.ForeignKey(
        DietPlans,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # ✅ Single kitchen (as per your requirement)
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="diet_plan_users"
    )
    #previous micro kitchen
    original_micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="originally_assigned_plans"
    )

    review = models.ForeignKey(
        NutritionistReview,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_diet_plans"
    )

    nutritionist_notes = models.TextField(null=True, blank=True)

    # 🔥 Plan Status
    STATUS_CHOICES = [
        ('suggested', 'Suggested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('payment_pending', 'Payment Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('stopped', 'Stopped'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='suggested')

    # 🔹 User response
    user_feedback = models.TextField(null=True, blank=True)
    decision_on = models.DateTimeField(null=True, blank=True)

    # 🔥 Payment Info
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('uploaded', 'Screenshot Uploaded'),
        ('verified', 'Verified'),
        ('failed', 'Failed')
    ]

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    # 📸 Screenshot Upload
    payment_screenshot = models.ImageField(
        upload_to='payment_screenshots/',
        null=True,
        blank=True
    )

    payment_uploaded_on = models.DateTimeField(null=True, blank=True)

    # ✅ Admin Verification
    is_payment_verified = models.BooleanField(default=False)

    verified_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments'
    )

    verified_on = models.DateTimeField(null=True, blank=True)

    # 📅 Plan duration
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # From this date the current `nutritionist` owns meal workflow (set on nutritionist reassignment)
    #for example if plan is from 26th to 28th of march and meals are set on 26th and the admin changes the nutrition starting from 28th then 26th and 27th meals are set by the previous nutritionist and 28th meal and future dates are set by the new nutritionist
    nutritionist_effective_from = models.DateField(null=True, blank=True)

    #for example if plan is from 26th to 28th of march and meals are set on 26th and the nutritionist assigns a new micro kitchen starting from 28th then 26th and 27th meals are set by the previous micro kitchen and 28th meal and future dates are set by the new micro kitchen

    micro_kitchen_effective_from = models.DateField(null=True, blank=True)

    # 🕒 Tracking
    suggested_on = models.DateTimeField(auto_now_add=True)
    approved_on = models.DateTimeField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    # =====================================================
    # 🔥 BUSINESS LOGIC METHODS
    # =====================================================

    def approve(self, start_date=None):
        """User approves the plan"""
        self.status = 'payment_pending'
        self.approved_on = now()
        self.decision_on = now()

        if start_date:
            self.start_date = start_date
            if self.diet_plan and self.diet_plan.no_of_days:
                # no_of_days=2 means start + end (inclusive): 26th + 27th → end_date = 27th = start + 1 day
                self.end_date = start_date + timedelta(days=self.diet_plan.no_of_days - 1)

        self.save()

    def reject(self, feedback=None):
        """User rejects the plan"""
        self.status = 'rejected'
        self.user_feedback = feedback
        self.decision_on = now()
        self.save()

    def upload_payment(self, screenshot, amount_paid=None, transaction_id=None):
        """User uploads payment screenshot"""
        self.payment_screenshot = screenshot
        self.payment_uploaded_on = now()
        self.amount_paid = amount_paid
        self.transaction_id = transaction_id
        self.payment_status = 'uploaded'
        self.status = 'payment_pending'
        self.save()

    def verify_payment(self, admin_user, start_date=None):
        """Admin verifies payment, assigns start date, and activates plan"""
        self.is_payment_verified = True
        self.verified_by = admin_user
        self.verified_on = now()

        self.payment_status = 'verified'
        self.status = 'active'

        if start_date:
            self.start_date = start_date
        elif not self.start_date:
            self.start_date = now().date()

        if self.diet_plan and self.diet_plan.no_of_days and self.start_date:
            # no_of_days=2 means start + end (inclusive): 26th + 27th → end_date = 27th = start + 1 day
            self.end_date = self.start_date + timedelta(days=self.diet_plan.no_of_days - 1)

        self.save()
        from .plan_payment import ensure_plan_payment_snapshot
        ensure_plan_payment_snapshot(self)

    def reject_payment(self):
        """Admin rejects payment"""
        self.payment_status = 'failed'
        self.status = 'payment_pending'
        self.is_payment_verified = False
        self.save()

    def __str__(self):
        return f"{self.user} - {self.diet_plan} ({self.status})"






class PlanPaymentSnapshot(models.Model):
    user_diet_plan = models.OneToOneField(
        UserDietPlan,
        on_delete=models.CASCADE,
        related_name='payment_snapshot'
    )

    # 💰 Plan details (copied)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)#amount paid from patient at the time of payment

    platform_percent = models.DecimalField(max_digits=5, decimal_places=2)#platform share % of gross at the time of payment
    nutrition_percent = models.DecimalField(max_digits=5, decimal_places=2)#nutritionist share % of gross at the time of payment
    kitchen_percent = models.DecimalField(max_digits=5, decimal_places=2)#kitchen share % of gross at the time of payment

    # 💵 Calculated amounts (fixed)
    platform_amount = models.DecimalField(max_digits=10, decimal_places=2)#platform amount at the time of payment
    nutrition_amount = models.DecimalField(max_digits=10, decimal_places=2)#nutritionist amount at the time of payment
    kitchen_amount = models.DecimalField(max_digits=10, decimal_places=2)#kitchen amount at the time of payment

    created_at = models.DateTimeField(auto_now_add=True)


class PayoutTracker(models.Model):
    snapshot = models.ForeignKey(
        PlanPaymentSnapshot,
        on_delete=models.CASCADE,
        related_name='payouts'
    )

    PAYOUT_TYPE = [
        ('nutritionist', 'Nutritionist'),
        ('kitchen', 'Kitchen'),
    ]

    payout_type = models.CharField(max_length=20, choices=PAYOUT_TYPE)

    # 👇 Only ONE will be used based on type
    nutritionist = models.ForeignKey(
        UserRegister, null=True, blank=True, on_delete=models.SET_NULL
    )
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile, null=True, blank=True, on_delete=models.SET_NULL
    )

    # 💰 Core fields
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # 🧠 Admin control
    is_closed = models.BooleanField(default=False)
    closed_reason = models.TextField(null=True, blank=True)

    closed_by = models.ForeignKey(
        UserRegister,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='closed_payouts'
    )

    closed_on = models.DateTimeField(null=True, blank=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('paid', 'Fully Paid'),
        ('closed', 'Closed Early'),
        ('cancelled', 'Cancelled'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    # 🔥 Derived values
    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    def __str__(self):
        if self.payout_type == 'nutritionist':
            return f"Nutritionist Payout - {self.nutritionist}"
        return f"Kitchen Payout - {self.micro_kitchen}"




class PayoutTransaction(models.Model):
    tracker = models.ForeignKey(
        PayoutTracker,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    payout_date = models.DateField(null=True, blank=True)

    payment_screenshot = models.ImageField(
        upload_to='payout_screenshots/',
        null=True,
        blank=True
    )

    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    ]

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        null=True,
        blank=True
    )

    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)

    note = models.CharField(max_length=100, null=True, blank=True)

    paid_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount_paid} paid on {self.paid_on}"