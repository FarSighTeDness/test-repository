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

            wait_for_container() {
              container_name="$1"
              port_label="$2"
              probe_command="$3"
              max_attempts=30
              attempt=1

              while [ "$attempt" -le "$max_attempts" ]; do
                if docker ps --filter "name=^/${container_name}$" --filter "status=running" | grep -q "$container_name"; then
                  if docker exec "$container_name" sh -c "$probe_command"; then
                    exposed_port=$(docker port "$container_name" "$port_label" 2>/dev/null || true)
                    echo "$container_name is ready. Published port: ${exposed_port:-not published}"
                    return 0
                  fi
                else
                  echo "$container_name failed to start correctly."
                  docker ps -a --filter "name=$container_name"
                  docker logs "$container_name" || true
                  return 1
                fi

                sleep 2
                attempt=$((attempt + 1))
              done

              echo "Timed out waiting for $container_name to become ready."
              docker ps -a --filter "name=$container_name"
              docker logs "$container_name" || true
              return 1
            }

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

              docker rm -f myapp-server >/dev/null 2>&1 || true
              docker rm -f myapp-client >/dev/null 2>&1 || true

              docker build -t myapp-server:latest ./server
              docker build -t myapp-client:latest ./client

              docker run -d --name myapp-server --network myapp-net --env-file server/.env -p 0.0.0.0:5001:5001 myapp-server:latest
              docker run -d --name myapp-client --network myapp-net -p 0.0.0.0:8001:80 myapp-client:latest
            fi

            wait_for_container myapp-server 5001/tcp "node --input-type=module -e \"import http from 'node:http'; const req = http.get('http://127.0.0.1:5001/', (res) => process.exit(res.statusCode < 500 ? 0 : 1)); req.on('error', () => process.exit(1)); req.setTimeout(2000, () => { req.destroy(); process.exit(1); });\""
            wait_for_container myapp-client 80/tcp "wget -qO- http://127.0.0.1/ >/dev/null"

            echo "Container port publication summary:"
            docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

            server_host_ip=$(docker inspect --format '{{(index (index .NetworkSettings.Ports "5001/tcp") 0).HostIp}}' myapp-server)
            client_host_ip=$(docker inspect --format '{{(index (index .NetworkSettings.Ports "80/tcp") 0).HostIp}}' myapp-client)

            echo "myapp-server published HostIp: $server_host_ip"
            echo "myapp-client published HostIp: $client_host_ip"

            [ "$server_host_ip" = "0.0.0.0" ] || [ "$server_host_ip" = "::" ]
            [ "$client_host_ip" = "0.0.0.0" ] || [ "$client_host_ip" = "::" ]

            # Verify host-facing ports from Jenkins agent side.
            wget -qO- http://127.0.0.1:5001/ >/dev/null
            wget -qO- http://127.0.0.1:8001/ >/dev/null
            echo "Host port checks passed: 5001 and 8001 are reachable from the Jenkins agent."
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