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
    REPO_URL = 'https://github.com/FarSighTeDness/test-repository.git'
    APP_DIR = 'test-repository'
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        script {
          def selectedBranch = (params.BRANCH ?: '').trim()
          env.DEPLOY_BRANCH = selectedBranch ? selectedBranch : 'main'
          echo "Using branch: ${env.DEPLOY_BRANCH}"
        }
        sh '''
          set -e
          git clone --depth 1 --branch "${DEPLOY_BRANCH}" "${REPO_URL}" "${APP_DIR}"
        '''
      }
    }

    stage('Validate Agent Tools') {
      steps {
        sh '''
          set -e

          command -v git >/dev/null 2>&1 || {
            echo "git is required on this Jenkins agent."
            exit 1
          }

          command -v docker >/dev/null 2>&1 || {
            echo "docker CLI is not available on this Jenkins agent."
            echo "Install docker CLI and give Jenkins access to Docker daemon (for example mount /var/run/docker.sock)."
            exit 1
          }
        '''
      }
    }

    stage('Deploy') {
      steps {
        dir("${APP_DIR}") {
          sh '''
            set -e

            if [ ! -f server/.env ] && [ -f server/.env.example ]; then
              cp server/.env.example server/.env
            fi

            if docker compose version >/dev/null 2>&1; then
              COMPOSE_CMD="docker compose"
            elif docker-compose version >/dev/null 2>&1; then
              COMPOSE_CMD="docker-compose"
            else
              COMPOSE_CMD=""
            fi

            if [ -n "$COMPOSE_CMD" ]; then
              echo "Docker Compose found. Deploying with Compose."
              $COMPOSE_CMD down --remove-orphans || true
              $COMPOSE_CMD up -d --build
            else
              echo "Docker Compose not found. Deploying with plain Docker."

              docker network inspect myapp-net >/dev/null 2>&1 || docker network create myapp-net

              docker rm -f server >/dev/null 2>&1 || true
              docker rm -f client >/dev/null 2>&1 || true

              docker build -t myapp-server:latest ./server
              docker build -t myapp-client:latest ./client

              docker run -d --name server --network myapp-net --env-file server/.env -p 5001:5001 myapp-server:latest
              docker run -d --name client --network myapp-net -p 8001:80 myapp-client:latest
            fi
          '''
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