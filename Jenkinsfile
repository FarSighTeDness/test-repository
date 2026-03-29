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
        sh '''
          set -e
          git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
        '''
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        dir("${APP_DIR}") {
          sh '''
            set -e

            if docker compose version >/dev/null 2>&1; then
              COMPOSE_CMD="docker compose"
            elif docker-compose version >/dev/null 2>&1; then
              COMPOSE_CMD="docker-compose"
            else
              echo "Docker Compose is not installed on this Jenkins agent."
              exit 1
            fi

            if [ ! -f server/.env ] && [ -f server/.env.example ]; then
              cp server/.env.example server/.env
            fi

            $COMPOSE_CMD down --remove-orphans || true
            $COMPOSE_CMD up -d --build
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