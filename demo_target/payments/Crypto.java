import java.security.*;
import javax.crypto.Cipher;

public class Crypto {
    static byte[] digest(byte[] data) throws Exception {
        return MessageDigest.getInstance("SHA-1").digest(data);
    }

    static KeyPair newKey() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        return kpg.generateKeyPair();
    }

    static Cipher legacyCipher() throws Exception {
        return Cipher.getInstance("DES/CBC/PKCS5Padding");
    }
}
