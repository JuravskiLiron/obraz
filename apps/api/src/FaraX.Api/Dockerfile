FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/FaraX.Api/FaraX.Api.csproj", "src/FaraX.Api/"]
COPY ["src/FaraX.Domain/FaraX.Domain.csproj", "src/FaraX.Domain/"]
COPY ["src/FaraX.Application/FaraX.Application.csproj", "src/FaraX.Application/"]
COPY ["src/FaraX.Infrastructure/FaraX.Infrastructure.csproj", "src/FaraX.Infrastructure/"]
RUN dotnet restore "src/FaraX.Api/FaraX.Api.csproj"
COPY . .
WORKDIR "/src/src/FaraX.Api"
RUN dotnet build "./FaraX.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FaraX.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FaraX.Api.dll"]
