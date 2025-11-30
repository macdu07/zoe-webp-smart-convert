# Zoe Convert

"Zoe Convert" es una aplicación web desarrollada con Next.js, diseñada para la conversión inteligente de imágenes al formato WebP. Permite a los usuarios cargar imágenes en formato JPG, JPEG o PNG, seleccionar la calidad de compresión deseada y convertirlas a WebP.

Una característica destacada es el uso de Inteligencia Artificial Generativa (a través de Genkit y el modelo Gemini de Google AI) para sugerir un nombre de archivo descriptivo y optimizado para SEO en español para la imagen convertida. La aplicación también ofrece una comparación visual entre la imagen original y la convertida, junto con detalles sobre la reducción de tamaño obtenida. El acceso a la aplicación está protegido por una clave de acceso segura.

## Características Principales

- **Conversión a WebP:** Transforma imágenes JPG, JPEG y PNG al formato WebP, conocido por su eficiencia en compresión y calidad.
- **Calidad Ajustable:** Permite al usuario seleccionar el nivel de calidad de compresión para el archivo WebP resultante (predeterminado en 90%).
- **Sugerencia de Nombre con IA:** Utiliza Genkit y Gemini para generar automáticamente un nombre de archivo descriptivo en español, en minúsculas y con guiones, optimizado para SEO.
- **Prefijo Personalizable:** Opción para añadir un prefijo al nombre de archivo generado por la IA.
- **Comparador Visual:** Muestra una comparativa lado a lado de la imagen original y la convertida, facilitando la evaluación de la calidad.
- **Estadísticas Detalladas:** Informa sobre el tamaño original, el tamaño convertido y el porcentaje de reducción de peso.
- **Descarga Fácil:** Botón para descargar la imagen WebP con el nombre sugerido.
- **Interfaz Intuitiva:** Diseño limpio y fácil de usar con componentes ShadCN UI y Tailwind CSS.
- **Seguridad Mejorada:** Autenticación del lado del servidor mediante cookies HTTP-only y Middleware.

## Instrucciones de Uso

1.  **Acceso a la Aplicación:**

    - Navega a la URL de la aplicación.
    - Ingresa la clave de acceso en la página de inicio de sesión. Esta clave se valida de forma segura en el servidor.

2.  **Carga de Imagen:**

    - En la página principal de conversión, haz clic en el área designada ("Click to upload or drag and drop") o arrastra un archivo de imagen (formatos admitidos: JPG, JPEG, PNG) a esta zona.
    - La imagen original se previsualizará.

3.  **Configuración de Conversión (Opcional):**

    - **Prefijo:** Si lo deseas, introduce un prefijo para el nombre del archivo en el campo "Optional file name prefix" (por ejemplo, `producto-nuevo-`).
    - **Calidad WebP:** Ajusta el control deslizante "WebP Quality Level" (rango de 5% a 100%, predeterminado en 90%) para definir la calidad de compresión. Valores más bajos resultan en archivos más pequeños pero pueden afectar la calidad visual.

4.  **Convertir y Analizar:**

    - Haz clic en el botón "Convert and Analyze".
    - El sistema procesará la imagen, la convertirá a WebP y utilizará la IA para generar un nombre de archivo sugerido.

5.  **Revisar Resultados:**

    - La sección "Conversion Result" mostrará:
      - **Suggested File Name (by Gemini):** El nombre de archivo generado por la IA. Puedes copiarlo usando el icono de copia.
      - **Comparador de Imágenes:** Un visor interactivo para comparar la imagen original con la convertida. Desliza el control para ver las diferencias.
      - **Estadísticas:**
        - `Quality Setting`: El nivel de calidad seleccionado.
        - `Original Size`: Tamaño del archivo original.
        - `Converted Size`: Tamaño del archivo WebP resultante.
        - `Size Reduction`: Porcentaje de reducción de tamaño, acompañado de una barra de progreso.

6.  **Descargar Imagen:**

    - Haz clic en el botón "Download WebP Image" para guardar la imagen convertida en tu dispositivo. Se descargará con el nombre de archivo sugerido.

7.  **Limpiar Formulario:**

    - Si deseas procesar una nueva imagen, haz clic en el botón "Clear". Esto eliminará la imagen cargada actualmente y restablecerá todos los campos del formulario.

8.  **Cerrar Sesión:**
    - Haz clic en el botón "Logout" ubicado en la cabecera de la página para cerrar tu sesión de forma segura.

## Desarrollo Local

Para ejecutar esta aplicación en tu entorno local:

1.  **Clonar el Repositorio:**

    ```bash
    git clone https://github.com/macdu07/zoe-webp-smart-convert.git
    cd zoe-webp-smart-convert
    ```

2.  **Instalar Dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**

    - Crea un archivo llamado `.env` en la raíz del proyecto.
    - Añade la siguiente línea, reemplazando `tu_clave_secreta_aqui` con la clave que desees para proteger el acceso:
      ```
      ACCESS_KEY=tu_clave_secreta_aqui
      ```
      _(Nota: `NEXT_PUBLIC_ACCESS_KEY` también es soportado por compatibilidad, pero `ACCESS_KEY` es preferible para seguridad)._
    - (Opcional) Si deseas que las funciones de IA de Genkit (como la generación de nombres de archivo) funcionen localmente, necesitarás configurar tu clave de API de Google AI. Añade al archivo `.env`:
      ```
      GOOGLE_API_KEY=tu_google_ai_api_key_aqui
      ```

4.  **Ejecutar la Aplicación:**

    ```bash
    npm run dev
    ```

5.  Abre tu navegador y visita `http://localhost:9002` (o el puerto que se indique en tu consola).

## Tecnologías Utilizadas

- **Next.js (App Router):** Framework de React para desarrollo frontend y backend.
- **React:** Biblioteca JavaScript para construir interfaces de usuario.
- **TypeScript:** Superset de JavaScript que añade tipado estático.
- **ShadCN UI:** Colección de componentes de UI reutilizables.
- **Tailwind CSS:** Framework CSS de utilidad primero para diseño rápido.
- **Genkit (con Gemini de Google AI):** Toolkit para construir funcionalidades de IA.
- **Jose:** Biblioteca para firma y verificación de tokens JWT (usada para la sesión segura).
- **Lucide React:** Biblioteca de iconos.
- **Firebase Studio:** Entorno de desarrollo.

---

Este proyecto fue iniciado en Firebase Studio.
