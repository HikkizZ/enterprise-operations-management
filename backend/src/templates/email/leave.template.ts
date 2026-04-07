interface LeaveApprovedTemplate {
    name: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reviewerComments?: string;
}

export function leaveApprovedTemplate({
    name, leaveType, startDate, endDate, reviewerComments
}: LeaveApprovedTemplate): string {
    return `
        <h2>Solicitud aprobada</h2>
        <p>Hola <b>${name}</b>,</p>
        <p>Tu solicitud de <b>${leaveType}</b> ha sido <span style="color:#28a745"><b>APROBADA</b></span>.</p>
        <ul>
            <li><b>Fecha inicio:</b> ${startDate}</li>
            <li><b>Fecha fin:</b> ${endDate}</li>
            ${reviewerComments ? `<li><b>Observaciones:</b> ${reviewerComments}</li>` : ''}
        </ul>
        <hr/>
        <small>Mensaje automático, no respondas este correo.</small>
    `;
}

export function leaveRejectedTemplate({
    name, leaveType, startDate, endDate, reviewerComments
}: LeaveApprovedTemplate): string {
    return `
        <h2>Solicitud rechazada</h2>
        <p>Hola <b>${name}</b>,</p>
        <p>Tu solicitud de <b>${leaveType}</b> ha sido <span style="color:#dc3545"><b>RECHAZADA</b></span>.</p>
        <ul>
            <li><b>Fecha inicio:</b> ${startDate}</li>
            <li><b>Fecha fin:</b> ${endDate}</li>
            ${reviewerComments ? `<li><b>Observaciones:</b> ${reviewerComments}</li>` : ''}
        </ul>
        <hr/>
        <small>Mensaje automático, no respondas este correo.</small>
    `;
}