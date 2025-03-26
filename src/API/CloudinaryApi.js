// src/API/CloudinaryApi.js
class CloudinaryApi {
    // Configuração do Cloudinary
    static cloudName = 'dqmefjtuz';
    static uploadPreset = 'ml_default'; // Usando o preset padrão
  
    /**
     * Faz upload de uma imagem para o Cloudinary diretamente do navegador
     * @param {File} file - O arquivo de imagem a ser enviado
     * @returns {Promise<string>} URL segura da imagem após o upload
     */
    static async uploadImage(file) {
      if (!file) {
        throw new Error('Nenhum arquivo fornecido para upload');
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('cloud_name', this.cloudName);
  
      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erro no upload: ${errorData.error?.message || 'Erro desconhecido'}`);
        }
  
        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        throw error;
      }
    }
  
    /**
     * Faz upload de uma imagem usando uma URL
     * @param {string} imageUrl - URL da imagem a ser enviada para o Cloudinary
     * @returns {Promise<string>} URL segura da imagem após o upload
     */
    static async uploadImageFromUrl(imageUrl) {
      if (!imageUrl) {
        throw new Error('Nenhuma URL de imagem fornecida');
      }
  
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('cloud_name', this.cloudName);
  
      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erro no upload: ${errorData.error?.message || 'Erro desconhecido'}`);
        }
  
        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        throw error;
      }
    }
  
    /**
     * Verifica se a URL já é do Cloudinary
     * @param {string} url - URL a ser verificada
     * @returns {boolean} True se for do Cloudinary, False caso contrário
     */
    static isCloudinaryUrl(url) {
      return url && url.includes('cloudinary.com');
    }
  }
  
  export default CloudinaryApi;