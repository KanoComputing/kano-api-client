#!/usr/bin/env groovy

@Library('kanolib') _

pipeline {
    agent {
        label 'ubuntu_18.04_with_docker'
    }
    post {
        always {
            step([$class: 'CheckStylePublisher', pattern: 'eslint.xml'])
        }
        regression {
            script {
                email.notifyCulprits()
            }
        }
        fixed {
            script {
                email.notifyCulprits()
            }
        }
    }
    stages {
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('install dependencies') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'npm-read-only', variable: 'NPM_TOKEN')]) {
                        sh "echo \"//registry.npmjs.org/:_authToken=${NPM_TOKEN}\" > .npmrc"
                        docker.image('node:8-alpine').inside {
                            sh "yarn --production=false"
                        }
                    }
                }
            }
        }
        stage('checkstyle') {
            steps {
                script {
                    docker.image('node:8-alpine').inside {
                        sh "yarn checkstyle-ci || exit 0"
                    }
                }
            }
        }
    }
}
