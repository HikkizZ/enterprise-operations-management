import bcrypt from 'bcrypt';

/* Encriptar contraseña de texto plano */
export const encryptPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/* Comparar contraseña de texto plano con contraseña encriptada */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};