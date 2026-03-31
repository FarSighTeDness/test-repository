pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to deploy')
  }

  environment {
    REPO_URL   = 'https://github.com/FarSighTeDness/test-repository.git'
    APP_DIR    = 'test-repository'
    PORT       = '5001'
    DB_USER    = 'postgres'
    DB_HOST    = '62.72.31.10'
    DB_PORT    = '5432'
    DB_NAME    = 'mydb'
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        dir("${APP_DIR}") {
          script {
            def selectedBranch = (params.BRANCH ?: '').trim()
            def deployBranch = selectedBranch ? selectedBranch : 'main'
            git branch: deployBranch,
                url: "${REPO_URL}"
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        dir("${APP_DIR}") {
          withCredentials([
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
            string(credentialsId: 'db-password', variable: 'DB_PASSWORD')
          ]) {
            sh '''
              set -e
              docker network inspect myapp-net >/dev/null 2>&1 || docker network create myapp-net
              docker rm -f myapp-server >/dev/null 2>&1 || true
              docker rm -f myapp-client >/dev/null 2>&1 || true

              docker build -t myapp-server:latest ./server
              docker build -t myapp-client:latest ./client

              docker run -d --name myapp-server --network myapp-net \
                -e PORT="$PORT" \
                -e JWT_SECRET="$JWT_SECRET" \
                -e DB_USER="$DB_USER" \
                -e DB_PASSWORD="$DB_PASSWORD" \
                -e DB_HOST="$DB_HOST" \
                -e DB_PORT="$DB_PORT" \
                -e DB_NAME="$DB_NAME" \
                -p 5001:5001 myapp-server:latest

              docker run -d --name myapp-client --network myapp-net -p 8001:80 myapp-client:latest
            '''
          }
        }
      }
    }

    stage('Verify Ports') {
      steps {
        sh '''
          set -e
          echo "Verifying Docker port publishing..."
          docker port myapp-server 5001/tcp >/dev/null 2>&1 || { echo "myapp-server port 5001 is not published"; exit 1; }
          docker port myapp-client 80/tcp >/dev/null 2>&1 || { echo "myapp-client port 8001 is not published"; exit 1; }

          echo "Checking service health from inside containers..."
          docker exec myapp-server node --input-type=module -e "import http from 'node:http'; const req = http.get('http://127.0.0.1:5001/', (res) => process.exit(res.statusCode < 500 ? 0 : 1)); req.on('error', () => process.exit(1)); req.setTimeout(2000, () => { req.destroy(); process.exit(1); });"
          docker exec myapp-client sh -c "wget -qO- http://127.0.0.1/ >/dev/null || (command -v curl >/dev/null 2>&1 && curl -fsS http://127.0.0.1/ >/dev/null)"

          echo "Ports verified successfully."
        '''
      }
    }
  }

  post {
    success { echo 'Deployment completed successfully and ports are exposed.' }
    failure { echo 'Deployment failed or ports not exposed.' }
    always  { echo 'Pipeline finished.' }
  }
}
