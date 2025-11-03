# petshop_backend/urls.py (O arquivo principal do projeto)

from django.contrib import admin
from django.urls import path, include # Garanta que 'include' está aqui

urlpatterns = [
    # A linha do Admin pertence a ESTE arquivo
    path('admin/', admin.site.urls),
    
    # A linha que conecta sua API pertence a ESTE arquivo
    path('api/', include('api.urls')), 
]