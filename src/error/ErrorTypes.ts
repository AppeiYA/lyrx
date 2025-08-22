export class CustomError extends Error{
    statusCode: number;

    constructor(message: string, statusCode: number, name: string){
        super(message);
        this.statusCode = statusCode;
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain 
    }
}

export class NotFoundError extends CustomError{
    constructor(message = "Resource Not Found"){
        super(message, 404, "NotFoundError");
        Object.setPrototypeOf(this, NotFoundError.prototype); //restore prototype chain
    }
}

export class BadException extends CustomError{
    constructor(message = "Error Processing Request", statusCode:number = 400, name: string = "BadExceptionError"){
        super(message, statusCode, name);
        Object.setPrototypeOf(this, BadException.prototype);
    }
}