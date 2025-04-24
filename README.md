
## 🧰 Tecnologias Utilizadas

- **Angular 19**: Frontend SPA moderno com TypeScript.
- **AWS Lambda**: Backend serverless para manipulação de dados.
- **Terraform**: Provisionamento e gerenciamento da infraestrutura.
- **LocalStack**: Simulação local da AWS (Lambda, S3, DynamoDB, etc).
- **Docker**: Containerização do ambiente local para fácil desenvolvimento.

---

## 🚀 Como Rodar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/task-manager.git
cd task-manager


## Prerequisites

- Node.js (latest LTS version)
- Python 3.9+
- Docker and Docker Compose
- AWS CLI (for local development with LocalStack)

## Setup and Running

### Backend (LocalStack)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start LocalStack using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Create the DynamoDB table:
   ```bash
   aws --endpoint-url=http://localhost:4566 dynamodb create-table \
     --table-name tasks \
     --attribute-definitions AttributeName=id,AttributeType=S \
     --key-schema AttributeName=id,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

4. Deploy Lambda functions:
   ```bash
   # Install required packages
   pip install boto3

   # Create ZIP files for Lambda functions
   zip -j create_task.zip lambda/create_task.py
   zip -j list_tasks.zip lambda/list_tasks.py
   zip -j update_task.zip lambda/update_task.py
   zip -j delete_task.zip lambda/delete_task.py

   # Create Lambda functions
   aws --endpoint-url=http://localhost:4566 lambda create-function \
     --function-name create-task \
     --runtime python3.8 \
     --handler create_task.lambda_handler \
     --zip-file fileb://create_task.zip \
     --role arn:aws:iam::000000000000:role/lambda-role

   # Repeat for other functions...
   ```

### Frontend (Angular)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## API Endpoints

- `POST /tasks` - Create a new task
- `GET /tasks` - List all tasks
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task

## Development

- Frontend code is in the `frontend/src` directory
- Lambda functions are in the `backend/lambda` directory
- LocalStack configuration is in `localstack/docker-compose.yml`
- Terraform configuration is in `terraform/`
