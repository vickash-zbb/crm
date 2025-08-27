# Project Deployment Configuration

This project is designed to be deployed on both GitHub Pages and Hostinger. Below are the instructions and configurations for each deployment method.

## Table of Contents

- [Deployment to GitHub Pages](#deployment-to-github-pages)
- [Deployment to Hostinger](#deployment-to-hostinger)

## Deployment to GitHub Pages

1. **GitHub Actions Workflow**: The project includes a GitHub Actions workflow located at `.github/workflows/deploy.yml`. This workflow automates the deployment process to GitHub Pages.

2. **Build Process**: Ensure that the project is built before deployment. The workflow will handle the build step automatically.

3. **Deployment Steps**: The workflow will push the built files to the `gh-pages` branch of the repository.

## Deployment to Hostinger

1. **Hosting Requirements**: Ensure that you have a Hostinger account and access to the file manager or FTP.

2. **Upload Files**: You will need to upload the contents of the `dist` folder (or the folder where your build files are located) to the public directory on Hostinger.

3. **Configuration**: Make sure to configure any necessary environment variables or settings specific to your application.

4. **Accessing Your Application**: Once uploaded, your application should be accessible via your Hostinger domain.

## Additional Information

For any issues or further assistance, please refer to the documentation provided in the respective deployment folders or contact support for the hosting service.