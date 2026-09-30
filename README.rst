Nox Package Registry
====================

This repository is the public package registry for the Nox build system. The
authoritative index is ``packages.json`` and it is consumed both by the website
and by Nox.

The website is intentionally simple and static so it can be hosted on GitHub
Pages or any static hosting provider.


Each registry entry follows the schema:

.. code-block:: json

   {
     "name": "Package name",
     "description": "Package description.",
     "url": "github:user/repository",
     "language": "rust",
     "riders": {
       "commands": ["cargo"]
     }
   }

Install a package with:

.. code-block:: sh

   nox install pkgs:package


Add your package
---------------

1. Make sure the project is hosted in a public GitHub repository and has a
  valid ``nox.build`` file. From the project directory, run ``nox validate``
  and resolve any errors before submitting it.
2. Fork this registry repository and edit ``packages.json``. Add one object to
  the existing ``packages`` array; do not replace the other entries.
3. Include the required ``name`` and ``url`` fields. The name must be unique,
  and the URL must use the form ``github:USER/REPOSITORY``. The optional
  ``description`` and ``language`` fields help people discover your project.
  Use ``riders.commands`` to list required toolchain commands, such as
  ``cargo`` or ``dmd``; use an empty array when there are no requirements.
4. Check that the registry remains valid JSON:

  .. code-block:: sh

    python3 -m json.tool packages.json > /dev/null

5. Open a pull request with your package entry. Include a short description
  of the project and confirm that you have tested ``nox validate`` in its
  repository.

For example, a package with no Rider requirements can use:

.. code-block:: json

  {
    "name": "Package name,
    "description": "Package description.",
    "url": "github:user/repository",
    "language": "rust",
    "riders": {
     "commands": []
    }
  }

The registry is a discovery mechanism; Nox fetches the GitHub repository and
validates the project before installing it.