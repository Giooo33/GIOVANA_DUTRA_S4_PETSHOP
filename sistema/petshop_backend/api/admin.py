# api/admin.py
from django.contrib import admin
from .models import Cliente, Produto, Venda, ItemVenda

# --- Configuração avançada para Vendas ---
# Isto define que os 'ItensVenda' serão editados DENTRO da página da 'Venda'
class ItemVendaInline(admin.TabularInline):
    model = ItemVenda
    extra = 1 # Começa mostrando 1 campo para adicionar item (pode ser 0)
    # Você pode adicionar campos 'readonly' se eles forem calculados automaticamente
    # readonly_fields = ('preco_unitario_momento',) 

@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'data_venda', 'valor_total', 'usuario')
    list_filter = ('data_venda', 'cliente', 'usuario')
    search_fields = ('cliente__nome',)
    inlines = [ItemVendaInline] # <- Aqui conectamos o inline acima
    date_hierarchy = 'data_venda' # Adiciona uma navegação por data

# --- Configuração para Clientes e Produtos ---

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'telefone') # Colunas que aparecem na lista
    search_fields = ('nome', 'email', 'telefone') # Campos que a busca vai procurar

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco', 'quantidade_estoque')
    search_fields = ('nome', 'categoria')
    list_filter = ('categoria',) # Adiciona um filtro rápido pela categoria
    
    # Destaque visual para estoque baixo (bônus!)
    def get_list_display(self, request):
        # Esta é uma forma simples de fazer o alerta visual no admin
        # Para cores, precisaria de um pouco mais de HTML
        return ('nome', 'categoria', 'preco', 'quantidade_estoque', 'alerta_estoque')

    def alerta_estoque(self, obj):
        if obj.quantidade_estoque < 5:
            return '⚠️ BAIXO'
        return 'OK'
    alerta_estoque.short_description = 'Status Estoque'

# Não precisamos registrar o ItemVenda novamente, pois ele já está "inline" na Venda.
# Se quiser vê-lo separadamente, descomente a linha abaixo:
# admin.site.register(ItemVenda)