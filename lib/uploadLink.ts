import { ApolloLink, Observable, Operation } from '@apollo/client';
// @ts-ignore - extract-files types compatibility issue
import { extractFiles } from 'extract-files';
import { print } from 'graphql';

// Función personalizada para detectar archivos extractables
function isExtractableFile(value: any): boolean {
  
  // Detectar ReactNativeFile (tiene uri, name, type)
  if (value && typeof value === 'object' && value.uri && typeof value.uri === 'string') {
    return true;
  }
  // Detectar File/Blob estándar
  if (typeof File !== 'undefined' && value instanceof File) {
    return true;
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return true;
  }
  
  return false;
}

export interface UploadLinkOptions {
  uri: string;
  fetchOptions?: RequestInit;
}

/**
 * Custom upload link for GraphQL multipart requests (file uploads)
 * Compatible with React Native and supports Strawberry GraphQL backend
 */
export function createUploadLink(options: UploadLinkOptions): ApolloLink {
  const { uri, fetchOptions = {} } = options;

  return new ApolloLink((operation: Operation) => {
    return new Observable((observer) => {
      const context = operation.getContext();
      const { headers = {}, ...contextFetchOptions } = context;

      
      // Buscar archivos manualmente en las variables
      const files: { path: string; file: any }[] = [];
      const clonedVariables = JSON.parse(JSON.stringify(operation.variables));
      
      // Buscar archivos en las variables
      Object.keys(operation.variables).forEach((key) => {
        const value = operation.variables[key];
        if (value && typeof value === 'object' && value.uri && typeof value.uri === 'string') {
          files.push({ path: `variables.${key}`, file: value });
          // Reemplazar el archivo con null en las variables clonadas
          clonedVariables[key] = null;
        }
      });
      
      const hasFiles = files.length > 0;

      // Prepare request body
      let body: any;
      let requestHeaders: Record<string, string> = {
        ...headers,
      };

      if (hasFiles) {
        const formData = new FormData();

        // Operations (query con variables pero sin los archivos)
        const operations = {
          query: print(operation.query),
          variables: clonedVariables,
          operationName: operation.operationName,
        };
        formData.append('operations', JSON.stringify(operations));

        // Map - mapea cada índice de archivo a su path en variables
        const map: Record<string, string[]> = {};
        files.forEach((fileInfo, index) => {
          map[index] = [fileInfo.path];
        });
        formData.append('map', JSON.stringify(map));

        // Files - agrega cada archivo al FormData
        files.forEach((fileInfo, index) => {
          const file = fileInfo.file;
          
          const fileToUpload = {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name || `upload_${index}.jpg`,
          } as any;
          
          formData.append(String(index), fileToUpload as any);
        });

        body = formData;
        // Don't set Content-Type for FormData (browser/RN will set it with boundary)
      } else {
        // Regular JSON request
        body = JSON.stringify({
          query: print(operation.query),
          variables: operation.variables,
          operationName: operation.operationName,
        });
        requestHeaders['Content-Type'] = 'application/json';
      }

      // Perform fetch
      fetch(uri, {
        method: 'POST',
        ...fetchOptions,
        ...contextFetchOptions,
        headers: requestHeaders,
        body,
      })
        .then(async (response) => {
          // Process response
          operation.setContext({ response });
          
          // Log response para debugging
          const contentType = response.headers.get('content-type');          
          // Si la respuesta no es exitosa, obtener el texto para debugging
          if (!response.ok) {
            const text = await response.text();
            console.error('❌ Error response:', text.substring(0, 500));
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
          }
          
          // Verificar que sea JSON
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Non-JSON response:', text.substring(0, 500));
            throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 200)}`);
          }
          
          return response.json();
        })
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          console.error('❌ Upload error:', error.message);
          observer.error(error);
        });
    });
  });
}
