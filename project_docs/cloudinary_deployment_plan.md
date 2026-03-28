# Cloudinary Integration & Deployment Plan

## 1. Cloudinary Integration (Backend)
Currently, uploaded files (videos, documents, frames, etc.) are stored in the local `uploads/` directory. Since Koyeb utilizes localized, ephemeral storage, we need to upload directly to Cloudinary.

**Tasks:**
- Add `cloudinary` configuration in `backend/main.py` or a new `backend/utils/cloudinary_utils.py`.
- Ensure `.env` includes `CLOUDINARY_URL` (or cloud_name, api_key, api_secret).
- Modify routers (`videos.py`, `vdo_ocr.py`, `quizzes.py`, `ocr.py`, `math.py`) to stream or upload `UploadFile` to Cloudinary using `cloudinary.uploader.upload`.
- Update the database schemas and records to store the returned `secure_url` from Cloudinary instead of a local file path.

## 2. Frontend Deployment (Netlify)
Netlify makes deploying the frontend very straightforward.

**Tasks:**
- Add a `netlify.toml` file to `frontend/` to specify the build command (usually `npm run build`) and the publish directory (usually `dist` for Vite or `build` for CRA).
- If you're using React Router (which you likely are based on `Login.jsx`), add a redirect rule for SPAs in `netlify.toml`:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- Ensure any `VITE_API_URL` or `REACT_APP_API_URL` environment variables are correctly configured in Netlify to point to the Koyeb backend URL.

## 3. Backend Deployment (Koyeb)
Koyeb simplifies deploying Docker containers natively. 

**Tasks:**
- Provide instructions for Koyeb to use your existing `backend/Dockerfile`.
- Map the required API keys as Koyeb environment variables:
  - `MONGO_URI`
  - `CLOUDINARY_URL`
  - `OPENAI_API_KEY` (and any other models)
- Expose the HTTP Port configured in the Dockerfile (typically `8000`).
- Ensure CORS configurations in `backend/main.py` include the Netlify domain so the frontend can successfully communicate with the backend.

Let me know if you would like me to proceed with executing these steps!
