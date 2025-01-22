from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

# Create your models here.
class User(AbstractUser):
    ROLES = (
        ('petitioner', 'Petitioner'),
        ('committee', 'Committee'),
    )
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    role = models.CharField(max_length=20, choices=ROLES, default='petitioner')
    bio_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} [{self.role}]"

class Petition(models.Model):
    STATUS = (
        ('open', 'Open'),
        ('closed', 'Closed'),
    )
    title = models.CharField(max_length=100)
    content= models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default='open')
    response = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='petitions',
        limit_choices_to={'role': 'petitioner'}
    )

    def __str__(self):
        return self.title

class Signature(models.Model):
    petition = models.ForeignKey(
        Petition,
        on_delete=models.CASCADE,
        related_name='signatures'
    )
    signer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='signatures',
        limit_choices_to={'role': 'petitioner'}
    )

    class Meta:
        unique_together = ('petition', 'signer')

    def __str__(self):
        return f"Signature of {self.signer.email} on {self.petition.title}"
