import { View } from "react-native-animatable";
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { ExpoGoogleDriveAPI } from 'expo-google-drive-api-wrapper';



const authConfig = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: makeRedirectUri({
      scheme: 'your-scheme', // Remplacez par le nom de votre schéma
      path: 'your-path', // Remplacez par le nom de votre chemin
    }),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
};

// Utiliser `useAuthRequest` pour obtenir les URL de connexion et de déconnexion
const [request, response, promptAsync] = useAuthRequest(authConfig, {
    // Lorsque `useAuthRequest` détecte une réponse, il déclenche cette fonction
    onSuccess: async (result) => {
      if (result.type === 'success') {
        // Récupérer le jeton d'accès OAuth
        const { authentication } = result;
        const { accessToken } = authentication;
  
        // Créer une instance de l'API Expo Google Drive
        const drive = new ExpoGoogleDriveAPI({ accessToken });
  
        // Téléverser un fichier vers Google Drive
        const fileMetadata = {
          name: 'FILENAME',
        };
        const media = {
          mimeType: 'MIME_TYPE',
          body: fs.createReadStream('PATH_TO_FILE'),
        };
        const file = await drive.createFile(fileMetadata, media);
        console.log('File ID:', file.id);
      }
    },
});

export function GoogleDriveConfig() {


    return (
        <View>

        </View>
    );

}


export function DatabaseGoogleDriveScreen() {

}