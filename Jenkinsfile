pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        NODE_ENV = 'production'
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '>>> [CI/CD] Pull mã nguồn mới nhất từ Git Repository...'
                checkout scm
            }
        }

        stage('2. Install Dependencies') {
            steps {
                echo '>>> [CI] Cài đặt dependencies cho Backend và Frontend...'
                dir('server') {
                    sh 'npm install'
                }
                dir('client') {
                    sh 'npm install'
                }
            }
        }

        stage('3. Run Automated Tests') {
            steps {
                echo '>>> [CI] Thực thi bộ kiểm thử tự động (Unit Test / Healthcheck)...'
                dir('server') {
                    sh 'npm test'
                }
            }
        }

        stage('4. Build Artifacts') {
            steps {
                echo '>>> [CI] Biên dịch mã nguồn Frontend (Vite Build)...'
                dir('client') {
                    sh 'npm run build'
                }
            }
        }

        stage('5. Docker Build & Containerize') {
            steps {
                echo '>>> [CD] Đóng gói Docker Images cho Client và Server...'
                sh '${DOCKER_COMPOSE} build'
            }
        }

        stage('6. Deploy Staging/Production') {
            steps {
                echo '>>> [CD] Khởi động các container triển khai hệ thống...'
                sh '${DOCKER_COMPOSE} down'
                sh '${DOCKER_COMPOSE} up -d'
                echo '>>> [CD] Kiểm tra trạng thái triển khai...'
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '==================================================='
            echo ' THÀNH CÔNG: Pipeline CI/CD Jenkins hoàn tất! Ứng dụng Game Store đã sẵn sàng.'
            echo '==================================================='
        }
        failure {
            echo '==================================================='
            echo ' THẤT BẠI: Quá trình Build/Test/Deploy gặp sự cố. Kiểm tra logs console!'
            echo '==================================================='
        }
    }
}