using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FaraX.Api.Middleware;

/// <summary>
/// Global action filter: validates every action argument that has a registered
/// FluentValidation validator, returning 400 with the first error message.
/// </summary>
public class ValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _provider;

    public ValidationFilter(IServiceProvider provider) => _provider = provider;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            if (_provider.GetService(validatorType) is IValidator validator)
            {
                var ctx = new ValidationContext<object>(arg);
                var result = await validator.ValidateAsync(ctx, context.HttpContext.RequestAborted);
                if (!result.IsValid)
                {
                    context.Result = new BadRequestObjectResult(new
                    {
                        error = result.Errors.First().ErrorMessage,
                        status = 400
                    });
                    return;
                }
            }
        }

        await next();
    }
}
