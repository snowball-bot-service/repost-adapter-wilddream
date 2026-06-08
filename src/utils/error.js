export class SnowballException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * 获取 Handle Data 失败错误
 */
export class FetchHandleDataFailedException extends SnowballException {
    method;
    handleId;
    msg;
    constructor(method, handleId, msg) {
        super(`Fetch Handle Data Failed Exception | Method: ${method} | Handle Id: ${handleId} | Message: ${msg}`);
        this.method = method;
        this.handleId = handleId;
        this.msg = msg;
    }
}
/**
 * 不支持的类型错误
 */
export class UnsupportedMethodException extends SnowballException {
    method;
    handleId;
    constructor(method, handleId) {
        super(`Unsupported Method Exception | Method: ${method} | Handle Id: ${handleId}`);
        this.method = method;
        this.handleId = handleId;
    }
}
/**
 * 不支持的进程错误
 */
export class UnsupportedProcessException extends SnowballException {
    process;
    source;
    constructor(process, source) {
        super(`Unsupported Method Exception | Process: ${process} | Source: ${source}`);
        this.process = process;
        this.source = source;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQWdCLGlCQUFrQixTQUFRLEtBQUs7SUFDbkQsWUFBc0IsT0FBZTtRQUNuQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEQsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7WUFDM0IsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakQ7SUFDSCxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyw4QkFBK0IsU0FBUSxpQkFBaUI7SUFFakQ7SUFDQTtJQUNBO0lBSGxCLFlBQ2tCLE1BQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLEdBQVc7UUFFM0IsS0FBSyxDQUFDLGdEQUFnRCxNQUFNLGlCQUFpQixRQUFRLGVBQWUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUozRixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsUUFBRyxHQUFILEdBQUcsQ0FBUTtJQUc3QixDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTywwQkFBMkIsU0FBUSxpQkFBaUI7SUFFN0M7SUFDQTtJQUZsQixZQUNrQixNQUFvQixFQUNwQixRQUFnQjtRQUVoQyxLQUFLLENBQUMsMENBQTBDLE1BQU0saUJBQWlCLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFIbkUsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixhQUFRLEdBQVIsUUFBUSxDQUFRO0lBR2xDLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLDJCQUE0QixTQUFRLGlCQUFpQjtJQUU5QztJQUNBO0lBRmxCLFlBQ2tCLE9BQXNCLEVBQ3RCLE1BQWM7UUFFOUIsS0FBSyxDQUFDLDJDQUEyQyxPQUFPLGNBQWMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUhoRSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RCLFdBQU0sR0FBTixNQUFNLENBQVE7SUFHaEMsQ0FBQztDQUNGIn0=