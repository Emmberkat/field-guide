{
  description = "Emma's Field Guide: software opinions, earned the hard way";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      packages = forAllSystems (pkgs: {
        # The static site, built exactly as `npm ci && npm run build` builds it.
        default = pkgs.buildNpmPackage {
          pname = "field-guide";
          version = (lib.importJSON ./package.json).version;

          src = lib.fileset.toSource {
            root = ./.;
            fileset = lib.fileset.unions [
              ./package.json
              ./package-lock.json
              ./astro.config.mjs
              ./tsconfig.json
              ./src
              ./public
            ];
          };

          # Dependencies come straight from package-lock.json integrity hashes,
          # so there is no npmDepsHash to update when dependencies change.
          npmDeps = pkgs.importNpmLock {
            package = lib.importJSON ./package.json;
            packageLock = lib.importJSON ./package-lock.json;
          };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          env.ASTRO_TELEMETRY_DISABLED = "1";

          installPhase = ''
            runHook preInstall
            cp -r dist $out
            runHook postInstall
          '';

          meta.description = "Emma's Field Guide, built as a static site";
        };

        # Serve the built site under its GitHub Pages base path.
        preview = pkgs.writeShellApplication {
          name = "field-guide-preview";
          runtimeInputs = [ pkgs.python3 ];
          text = ''
            root=$(mktemp -d)
            trap 'rm -r "$root"' EXIT
            ln -s ${self.packages.${pkgs.stdenv.hostPlatform.system}.default} "$root/field-guide"
            port=''${PORT:-8000}
            echo "Serving http://localhost:$port/field-guide/"
            python3 -m http.server "$port" --directory "$root"
          '';
          meta.description = "Serve the built field guide locally";
        };
      });

      apps = forAllSystems (pkgs: {
        default = {
          type = "app";
          program = lib.getExe self.packages.${pkgs.stdenv.hostPlatform.system}.preview;
          meta.description = "Serve the built field guide at http://localhost:8000/field-guide/";
        };
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [ pkgs.nodejs ];
          ASTRO_TELEMETRY_DISABLED = "1";
        };
      });

      checks = forAllSystems (pkgs: {
        build = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
      });

      formatter = forAllSystems (pkgs: pkgs.nixfmt);
    };
}
