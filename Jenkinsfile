#!groovy

node {

    stage('checkout') {
        checkout scm
    }

    stage('prepare') {
        env.NODE_ENV = 'staging'
        if (env.BRANCH_NAME == 'prod') {
            env = 'production'
        }
        def nodeVersion = readNodeVersion()
        def nodeHome = tool name: "Node ${nodeVersion}", type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        env.PATH = "${nodeHome}/bin:${env.PATH}"
        sh "node -v"
        sh "npm -v"
    }

    stage('install dependencies') {
        sh "npm install"
    }

    stage('run tests') {
        sh "npm test"
    }
    
}
