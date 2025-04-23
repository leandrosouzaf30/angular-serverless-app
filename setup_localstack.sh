#!/bin/bash

set -e

echo "🔧 Iniciando setup no LocalStack..."

LAMBDA_DIR="backend/lambdas"
ENDPOINT="http://localhost:4566"
ROLE_ARN="arn:aws:iam::000000000000:role/TaskLambdaExecutionRole"

echo "📁 Criando arquivo dynamodb.json..."
cat <<EOF > dynamodb.json
{
  "TableName": "Tasks",
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ],
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}
EOF

echo "📦 Criando tabela DynamoDB..."
aws --endpoint-url=$ENDPOINT dynamodb create-table --cli-input-json file://dynamodb.json

echo "🧬 Criando funções Lambda..."
for fn in create_task read_task update_task delete_task; do
  echo "🧩 Função: $fn"
  zip -j "$fn.zip" "$LAMBDA_DIR/$fn.py"
  aws --endpoint-url=$ENDPOINT lambda create-function \
    --function-name "$fn" \
    --runtime python3.9 \
    --role $ROLE_ARN \
    --handler "$fn.lambda_handler" \
    --zip-file "fileb://$fn.zip"
done

echo "🌐 Criando API Gateway REST..."
REST_API_ID=$(aws --endpoint-url=$ENDPOINT apigateway create-rest-api --name "TaskApi" | jq -r '.id')
PARENT_ID=$(aws --endpoint-url=$ENDPOINT apigateway get-resources --rest-api-id $REST_API_ID | jq -r '.items[0].id')

# Cria o recurso /tasks
TASKS_ID=$(aws --endpoint-url=$ENDPOINT apigateway create-resource --rest-api-id $REST_API_ID --parent-id $PARENT_ID --path-part tasks | jq -r '.id')

# Cria o recurso /tasks/{id}
TASK_ID=$(aws --endpoint-url=$ENDPOINT apigateway create-resource --rest-api-id $REST_API_ID --parent-id $TASKS_ID --path-part "{id}" | jq -r '.id')

# Função para criar métodos e integrar com Lambda
create_method() {
  RESOURCE_ID=$1
  METHOD=$2
  FN_NAME=$3

  aws --endpoint-url=$ENDPOINT apigateway put-method \
    --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --authorization-type "NONE"

  aws --endpoint-url=$ENDPOINT apigateway put-integration \
    --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:$FN_NAME/invocations
}

echo "🔗 Ligando métodos com Lambdas..."
create_method $TASKS_ID POST create_task
create_method $TASKS_ID GET read_task
create_method $TASK_ID PUT update_task
create_method $TASK_ID DELETE delete_task

echo "📤 Deploy do API Gateway..."
aws --endpoint-url=$ENDPOINT apigateway create-deployment \
  --rest-api-id $REST_API_ID \
  --stage-name dev

echo "🌐 Endpoint base: http://localhost:4566/restapis/$REST_API_ID/dev/_user_request_/tasks"

echo "✅ Setup concluído com sucesso!"
