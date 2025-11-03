# api/views.py
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django.db import transaction # Para a transação da Venda!
from .models import Produto, Cliente, Venda, ItemVenda
from .serializers import ProdutoSerializer, ClienteSerializer
# Importe os outros serializers...

# Filtros para Busca e Ordenação
from django_filters.rest_framework import DjangoFilterBackend

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome'] # Permite buscar por nome: /api/clientes/?search=...

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome'] # Permite buscar por nome: /api/produtos/?search=...
    
    # Resposta da Pergunta 2 (Ordenação)
    # Permite ordenar: /api/produtos/?ordering=nome
    ordering_fields = ['nome'] 

# --- A LÓGICA DE VENDA (RESPOSTAS DA PERGUNTA 1) ---
# Esta é a view mais complexa

class VendaViewSet(viewsets.ViewSet):
    """
    Endpoint customizado para criar vendas, pois envolve lógica de negócio.
    """
    
    # Resposta da Pergunta 1a: O nome da função é "create"
    def create(self, request):
        dados = request.data # Pega { cliente_id, produto_id, quantidade, ... }
        
        try:
            produto_id = dados.get('produto_id')
            quantidade_desejada = int(dados.get('quantidade'))
            
            # Garante que ninguém venda ao mesmo tempo (transação atômica)
            # Resposta da Pergunta 1c (Início)
            with transaction.atomic():
                # Busca o produto e "trava" a linha no banco até a transação acabar
                produto = Produto.objects.select_for_update().get(id=produto_id)

                # 1. Verificar o Estoque
                if produto.quantidade_estoque < quantidade_desejada:
                    # Resposta da Pergunta 1b (Mensagem de Erro)
                    mensagem_erro = f"Estoque insuficiente. Produto '{produto.nome}' possui apenas {produto.quantidade_estoque} unidades."
                    return Response(
                        {"detalhe": mensagem_erro}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # 2. Se houver estoque, efetivar a venda
                
                # 3. Atualizar o estoque
                produto.quantidade_estoque -= quantidade_desejada
                produto.save()
                
                # 4. Registrar a Venda (simplificado para 1 item por venda)
                # (Aqui você pegaria o cliente_id, usuario_id, etc.)
                # ... Lógica para criar o objeto Venda e ItemVenda ...
                # ... Calcular valor_total = produto.preco * quantidade_desejada
                
                # 5. Criar o resumo
                resumo = {
                    "cliente": "Nome do Cliente", # (Buscar o nome do cliente)
                    "produto": produto.nome,
                    "quantidade": quantidade_desejada,
                    "valor_total": produto.preco * quantidade_desejada,
                    "data": "data da venda"
                }
                
                # Resposta da Pergunta 1c (Fim)
                # O transaction.atomic() faz o COMMIT aqui se tudo deu certo
                
                return Response(resumo, status=status.HTTP_201_CREATED)

        except Produto.DoesNotExist:
            return Response({"detalhe": "Produto não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Resposta da Pergunta 1c (Rollback)
            # Se qualquer erro ocorrer, o transaction.atomic() faz o ROLLBACK
            return Response({"detalhe": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)