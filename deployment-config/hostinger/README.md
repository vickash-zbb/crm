# Hostinger Deployment Instructions

This document provides instructions for deploying the project to Hostinger.

## Prerequisites

1. **Hostinger Account**: Ensure you have an active Hostinger account.
2. **Domain Setup**: Make sure your domain is set up and pointing to your Hostinger hosting.

## Deployment Steps

1. **Build the Project**:
   Before deploying, you need to build your project. Run the following command in your project directory:
   ```
   npm run build
   ```
   This will generate the production-ready files in the `dist` directory (or the directory specified in your build configuration).

2. **Access Hostinger File Manager**:
   - Log in to your Hostinger account.
   - Navigate to the File Manager.

3. **Upload Files**:
   - Go to the `public_html` directory (or the directory associated with your domain).
   - Upload the contents of the `dist` directory generated in the previous step. Ensure that all files are uploaded correctly.

4. **Configure Domain (if necessary)**:
   - If you are using a custom domain, ensure that it is correctly configured to point to your Hostinger hosting.

5. **Test Your Application**:
   - After uploading, visit your domain in a web browser to ensure that the application is running correctly.

## Additional Notes

- If you encounter any issues, check the Hostinger documentation or contact their support for assistance.
- Make sure to keep your dependencies updated and regularly check for any security updates.

By following these steps, you should be able to successfully deploy your project to Hostinger.