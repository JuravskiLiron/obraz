namespace FaraX.Application.Common;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public sealed class NotFoundException : AppException
{
    public NotFoundException(string message = "Resource not found") : base(message, 404) { }
}

public sealed class ConflictException : AppException
{
    public ConflictException(string message = "Conflict") : base(message, 409) { }
}

public sealed class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized") : base(message, 401) { }
}
