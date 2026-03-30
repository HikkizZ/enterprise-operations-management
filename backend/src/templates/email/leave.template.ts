interface LeaveApprovedTemplate {
    name: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
}

export function leaveApprovedTemplate({
    name, leaveType, startDate, endDate, reason
}: LeaveApprovedTemplate): string {
    return `
        <h2>Solicitud aprobada</h2>
        <p>Hola <b>${name}</b>,</p>
        <p>Tu solicitud de <b>${leaveType}</b> ha sido <span style="color:#28a745"><b>APROBADA</b></span>.</p>
        <ul>
            <li><b>Fecha inicio:</b> ${startDate}</li>
            <li><b>Fecha fin:</b> ${endDate}</li>
            ${reason ? `<li><b>Observaciones:</b> ${reason}</li>` : ''}
        </ul>
        <hr/>
        <small>Mensaje automático, no respondas este correo.</small>
    `;
}

export function leaveRejectedTemplate({
    name, leaveType, startDate, endDate, reason
}: LeaveApprovedTemplate): string {
    return `
        <h2>Solicitud rechazada</h2>
        <p>Hola <b>${name}</b>,</p>
        <p>Tu solicitud de <b>${leaveType}</b> ha sido <span style="color:#dc3545"><b>RECHAZADA</b></span>.</p>
        <ul>
            <li><b>Fecha inicio:</b> ${startDate}</li>
            <li><b>Fecha fin:</b> ${endDate}</li>
            ${reason ? `<li><b>Motivo:</b> ${reason}</li>` : ''}
        </ul>
        <hr/>
        <small>Mensaje automático, no respondas este correo.</small>
    `;
}