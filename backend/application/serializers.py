from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Petition, Signature
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'date_of_birth',
            'bio_id',
            'role',
            'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True},
        }

    def create(self, validated_data):
        bio_id = validated_data.get('bio_id')
        password = validated_data.pop('password', None)
        user = User(
            username=validated_data['email'], #it works with this
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            date_of_birth=validated_data['date_of_birth'],
            bio_id=bio_id,
        )
        if password:
            user.set_password(password)
        user.save()
        return user

class PetitionSerializer(serializers.ModelSerializer):
    signatures_count = serializers.IntegerField(read_only=True)
    already_signed = serializers.IntegerField(read_only=True)
    creator_email = serializers.EmailField(source='creator.email', read_only=True)

    class Meta:
        model = Petition
        fields = [
            'id',
            'title',
            'content',
            'status',
            'response',
            'creator',
            "creator_email",
            'signatures_count',
            'already_signed',
        ]
        read_only_fields = [
            'id',
            'status',
            'response',
            'creator',
        ]
class SignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signature
        fields = [
            'id',
            'petition',
            'signer',
        ]
        read_only_fields = [
            'id',
            'signer',
        ]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': self.user.id,
            'role': self.user.role,
            'email': self.user.email,
            'full_name': self.user.full_name,
        }
        return data