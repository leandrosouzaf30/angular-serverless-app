# backend/function/app.py
import json
import boto3
import uuid
import os

# Configuração do DynamoDB
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME', 'Items')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    # Determinar a operação pelo método HTTP
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters', {}) or {}
    
    # CREATE - POST /items
    if http_method == 'POST' and path == '/items':
        return create_item(event)
    
    # READ - GET /items/{id}
    elif http_method == 'GET' and path_parameters.get('id'):
        return get_item(path_parameters.get('id'))
    
    # LIST - GET /items
    elif http_method == 'GET' and path == '/items':
        return list_items()
    
    # UPDATE - PUT /items/{id}
    elif http_method == 'PUT' and path_parameters.get('id'):
        return update_item(path_parameters.get('id'), event)
    
    # DELETE - DELETE /items/{id}
    elif http_method == 'DELETE' and path_parameters.get('id'):
        return delete_item(path_parameters.get('id'))
    
    # Rota não encontrada
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Rota não encontrada'})
        }

def create_item(event):
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'title' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Nome é obrigatório'})
            }
        
        item_id = str(uuid.uuid4())
        item = {
            'id': item_id,
            'title': body['title'],
            'description': body.get('description', ''),
            'completed': False
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'body': json.dumps(item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def get_item(item_id):
    try:
        response = table.get_item(Key={'id': item_id})
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Item não encontrado'})
            }
        
        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def list_items():
    try:
        response = table.scan()
        items = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def update_item(item_id, event):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Verificar se o item existe
        response = table.get_item(Key={'id': item_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Item não encontrado'})
            }
        
        # Atualizar o item
        update_expression = "set "
        expression_values = {}
        
        if 'title' in body:
            update_expression += "title = :title, "
            expression_values[':title'] = body['title']
        
        if 'description' in body:
            update_expression += "description = :description, "
            expression_values[':description'] = body['description']
        
        if 'completed' in body:
            update_expression += "completed = :completed, "
            expression_values[':completed'] = body['completed']
            
        # Remover a vírgula extra no final
        update_expression = update_expression.rstrip(', ')
        

        
        if not expression_values:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Nenhum campo para atualizar'})
            }
        
        table.update_item(
            Key={'id': item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues="ALL_NEW"
        )
        
        # Retornar o item atualizado
        updated_item = table.get_item(Key={'id': item_id}).get('Item')
        
        return {
            'statusCode': 200,
            'body': json.dumps(updated_item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def delete_item(item_id):
    try:
        # Verificar se o item existe
        response = table.get_item(Key={'id': item_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Item não encontrado'})
            }
        
        # Excluir o item
        table.delete_item(Key={'id': item_id})
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item excluído com sucesso'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }