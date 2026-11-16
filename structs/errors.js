module.exports = {
    create(code, numericCode, message, service, intent, vars) {
        return {
            errorCode: code,
            errorMessage: message,
            messageVars: vars || undefined,
            numericErrorCode: numericCode,
            originatingService: service,
            intent: intent || "prod"
        };
    },

    notFound(resource, id, service) {
        return this.create(
            "errors.com.pikilines.common.not_found",
            1004,
            `Error: El recurso '${resource}' (${id}) no fue encontrado.`,
            service,
            "prod",
            [resource, id]
        );
    },

    method(service, intent) {
        return this.create(
            "errors.com.pikilines.common.method_not_allowed",
            1009,
            "Error: el recurso al que estás intentando acceder no puede ser accedido con el método HTTP que usaste (API de solo lectura).",
            service,
            intent || "prod"
        );
    }
};
