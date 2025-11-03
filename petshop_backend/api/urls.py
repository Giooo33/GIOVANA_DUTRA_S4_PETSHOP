# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'produtos', views.ProdutoViewSet)
router.register(r'clientes', views.ClienteViewSet)
router.register(r'vendas', views.VendaViewSet, basename='venda')

urlpatterns = [
    path('', include(router.urls)),
    # URL de Autenticação (vamos usar Token)
    path('auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token),
]