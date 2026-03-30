export function credentialsTemplate({
    name,
    corporateEmail,
    password
}: {
    name: string;
    corporateEmail: string;
    password: string;
}): string {
    return `
        <h2>Bienvenido/a al sistema</h2>
        <p>Hola <b>${name}</b>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso:</p>
        <ul>
            <li><b>Usuario:</b> ${corporateEmail}</li>
            <li><b>Contraseña Temporal:</b> ${password}</li>
        </ul>
        <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
        <hr/>
        <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
    `;
};