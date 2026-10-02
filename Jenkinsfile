pipeline {
    agent any

    environment {
        // Tự động nhận diện docker compose (V2) hoặc docker-compose (V1)
        DOCKER_COMPOSE = 'docker compose'
        PATH = "/usr/local/bin:/usr/bin:/bin:$PATH"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '>>> [CI/CD] 1. Pull ma nguon tu Git Repository...'
                checkout scm
            }
        }

        stage('2. Install Dependencies') {
            steps {
                echo '>>> [CI] 2. Kiem tra Node/NPM & Cai dat day du dependencies...'
                sh '''
                    node -v
                    npm -v
                '''
                dir('server') {
                    sh 'npm install'
                }
                dir('client') {
                    // Bat buoc cai ca devDependencies de co lenh vite build
                    sh 'npm install --include=dev'
                }
            }
        }

        stage('3. Run Automated Tests') {
            steps {
                echo '>>> [CI] 3. Thuc thi bo kiem thu tu dong (Jest Tests)...'
                dir('server') {
                    sh 'npm test'
                }
            }
        }

        stage('4. Build Artifacts') {
            steps {
                echo '>>> [CI] 4. Build Vite Frontend cho Production...'
                dir('client') {
                    sh 'npm run build'
                }
            }
        }

        stage('5. Docker Build & Containerize') {
            steps {
                echo '>>> [CD] 5. Dong goi Docker Images...'
                sh '''
                    if command -v docker-compose >/dev/null 2>&1; then
                        docker-compose build
                    else
                        docker compose build
                    fi
                '''
            }
        }

        stage('6. Deploy Staging/Production') {
            steps {
                echo '>>> [CD] 6. Khoi dong ung dung Game Store bang Docker Compose...'
                sh '''
                    if command -v docker-compose >/dev/null 2>&1; then
                        docker-compose down || true
                        docker-compose up -d
                    else
                        docker compose down || true
                        docker compose up -d
                    fi
                    docker ps
                '''
            }
        }
    }

    post {
        success {
            echo '==================================================='
            echo ' THÀNH CÔNG: Pipeline CI/CD Jenkins hoàn tất 100%!'
            echo ' Web Game đã được triển khai tại: http://localhost:80'
            echo '==================================================='
        }
        failure {
            echo '==================================================='
            echo ' THẤT BẠI: Quá trình Build/Test/Deploy gặp sự cố.'
            echo ' Vui lòng kiểm tra Console Output của Stage bị đỏ.'
            echo '==================================================='
        }
    }
}