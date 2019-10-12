export class Keylessdatos {
    public codigosCargados: Array<string>;
    public credito: number;
    public email: string;

    constructor(email: string, codigosCargados: Array<string> = new Array<string>(), credito: number = 0) {
        this.codigosCargados = codigosCargados;
        this.credito = credito;
        this.email = email;
    }

    public toJson() {
        return {
            codigosCargados: this.codigosCargados,
            credito: this.credito,
            email: this.email,
        };
    }
}
