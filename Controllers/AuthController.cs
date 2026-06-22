using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManager.Core.Entities;
using TaskManager.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUsuarioRepository usuarioRepository, IConfiguration configuration)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
        }

        

        // 2. POST: api/auth/login (PÚBLICO)
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // 1. Validación de seguridad básica frente a nulos
            if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { mensaje = "El usuario y la contraseña son obligatorios." });
            }

            // 2. Bypass de depuración: Si es el admin por defecto, le damos acceso directo
            if (model.Username.Trim().ToLower() == "admin" && model.Password == "password123")
            {
                var jwtSettings = _configuration.GetSection("Jwt");
                var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

                // Hardcodeo los claims para evitar que truene si la propiedad Role es nula en la BD
                var claims = new[]
                {
            new Claim(ClaimTypes.Name, "admin"),
            new Claim(ClaimTypes.Role, "Admin")
        };

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddHours(2),
                    Issuer = jwtSettings["Issuer"],
                    Audience = jwtSettings["Audience"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                return Ok(new { token = tokenString, expiracion = tokenDescriptor.Expires });
            }

            // 3. Flujo alterno normal si busca en la base de datos
            var usuario = await _usuarioRepository.GetByUsernameAsync(model.Username);
            if (usuario == null || !BCrypt.Net.BCrypt.Verify(model.Password, usuario.PasswordHash))
            {
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });
            }

            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });
            }

        public class LoginModel
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

     
    }
}