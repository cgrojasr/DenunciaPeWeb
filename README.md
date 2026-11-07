# DenunciaPeWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Registro de tránsito (HU-FE-01)

El formulario está disponible en `/transito/register` y usa un catálogo y un
servicio de borrador simulados, sin enviar datos al servidor. El borrador se
guarda en `sessionStorage` de la pestaña, se recupera al volver al formulario y
se elimina al descartarlo desde el registro o cerrar sesión. El siguiente paso
abre el componente de ubicación de tránsito, que todavía no registra una
ubicación ni envía una denuncia.
La marca, el modelo y el color del vehículo, así como las observaciones,
son opcionales; la placa sigue siendo obligatoria.

Hasta contar con las reglas oficiales se aplica un mínimo de 20 caracteres
para la descripción, igual que en el formulario general, y se aceptan placas
de seis caracteres alfanuméricos, con o sin guion (3-3 o 4-2).

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
