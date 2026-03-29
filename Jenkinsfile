pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    REPO_URL = 'https://github.com/FarSighTeDness/test-repository.git'
    APP_DIR = 'test-repository'
    APP_PORT = '5001'
    DB_HOST = '62.72.31.10'
    DB_PORT = '5432'
    DB_NAME = 'mydb'
    DB_USER = 'postgres'
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        sh '''
          set -e
          git clone --depth 1 --branch main "${REPO_URL}" "${APP_DIR}"
        '''
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

              if [ -z "${DB_PASSWORD}" ]; then
                echo "DB_PASSWORD is empty. Update Jenkins credential: db-password"
                exit 1
              fi
              echo "DB_PASSWORD loaded from Jenkins credential db-password (value hidden)."

              # Generate server .env from Jenkins variables and credentials.
              cat > server/.env <<EOF
PORT=${APP_PORT}
JWT_SECRET=${JWT_SECRET}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
EOF

              # Prepare network and remove old containers if they exist.
              docker network inspect myapp-net >/dev/null 2>&1 || docker network create myapp-net
              docker rm -f server >/dev/null 2>&1 || true
              docker rm -f client >/dev/null 2>&1 || true

              # Build images.
              docker build -t myapp-server:latest ./server
              docker build -t myapp-client:latest ./client

              # Run containers.
              docker run -d --name server --network myapp-net --env-file server/.env -p ${APP_PORT}:${APP_PORT} myapp-server:latest
              docker run -d --name client --network myapp-net -p 8001:80 myapp-client:latest
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully.'
    }
    failure {
      echo 'Deployment failed. Check Jenkins console output for details.'
    }
    always {
      echo 'Pipeline finished.'
    }
  }
}