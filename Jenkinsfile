pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
  }

  environment {
    REPO_URL = 'https://github.com/FarSighTeDness/test-repository.git'
    BRANCH_NAME_TO_BUILD = 'main'
    APP_DIR = 'test-repository'
    APP_PORT = '5001'
    CLIENT_PORT = '8001'
    DOCKER_NETWORK = 'myapp-net'
    SERVER_CONTAINER = 'server'
    CLIENT_CONTAINER = 'client'
    SERVER_IMAGE = 'myapp-server'
    CLIENT_IMAGE = 'myapp-client'
    DB_HOST = '62.72.31.10'
    DB_PORT = '5432'
    DB_NAME = 'mydb'
    DB_USER = 'postgres'
  }

  stages {
    stage('Validate Agent') {
      steps {
        sh '''
          set -e
          command -v git >/dev/null 2>&1 || { echo "git is required on Jenkins agent"; exit 1; }
          command -v docker >/dev/null 2>&1 || { echo "docker is required on Jenkins agent"; exit 1; }
        '''
      }
    }

    stage('Checkout') {
      steps {
        deleteDir()
        checkout([
          $class: 'GitSCM',
          branches: [[name: "*/${BRANCH_NAME_TO_BUILD}"]],
          userRemoteConfigs: [[
            url: "${REPO_URL}",
            credentialsId: 'github-creds'
          ]],
          extensions: [
            [$class: 'RelativeTargetDirectory', relativeTargetDir: "${APP_DIR}"],
            [$class: 'CloneOption', shallow: true, depth: 1, noTags: false, timeout: 10]
          ]
        ])
      }
    }

    stage('Build Images') {
      steps {
        dir("${APP_DIR}") {
          withCredentials([
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
            string(credentialsId: 'db-password', variable: 'DB_PASSWORD')
          ]) {
            sh '''
              set -e

              if [ -z "${JWT_SECRET}" ]; then
                echo "JWT_SECRET is empty. Update Jenkins credential: jwt-secret"
                exit 1
              fi

              if [ -z "${DB_PASSWORD}" ]; then
                echo "DB_PASSWORD is empty. Update Jenkins credential: db-password"
                exit 1
              fi
              echo "Required secrets are loaded from Jenkins credentials."

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

              SERVER_TAG=${BUILD_NUMBER}
              CLIENT_TAG=${BUILD_NUMBER}

              docker build -t ${SERVER_IMAGE}:${SERVER_TAG} -t ${SERVER_IMAGE}:latest ./server
              docker build -t ${CLIENT_IMAGE}:${CLIENT_TAG} -t ${CLIENT_IMAGE}:latest ./client

              echo "Built ${SERVER_IMAGE}:${SERVER_TAG} and ${CLIENT_IMAGE}:${CLIENT_TAG}"
            '''
          }
        }
      }
    }

    stage('Deploy Containers') {
      steps {
        dir("${APP_DIR}") {
          sh '''
            set -e

            docker network inspect ${DOCKER_NETWORK} >/dev/null 2>&1 || docker network create ${DOCKER_NETWORK}

            docker rm -f ${SERVER_CONTAINER} >/dev/null 2>&1 || true
            docker rm -f ${CLIENT_CONTAINER} >/dev/null 2>&1 || true

            docker run -d \
              --name ${SERVER_CONTAINER} \
              --restart unless-stopped \
              --network ${DOCKER_NETWORK} \
              --env-file server/.env \
              -p ${APP_PORT}:${APP_PORT} \
              ${SERVER_IMAGE}:latest

            docker run -d \
              --name ${CLIENT_CONTAINER} \
              --restart unless-stopped \
              --network ${DOCKER_NETWORK} \
              -p ${CLIENT_PORT}:80 \
              ${CLIENT_IMAGE}:latest
          '''
        }
      }
    }

    stage('Verify Deployment') {
      steps {
        dir("${APP_DIR}") {
          sh '''
            set -e

            docker ps --filter "name=${SERVER_CONTAINER}" --filter "status=running" | grep ${SERVER_CONTAINER}
            docker ps --filter "name=${CLIENT_CONTAINER}" --filter "status=running" | grep ${CLIENT_CONTAINER}

            echo "Deployment verification passed."
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