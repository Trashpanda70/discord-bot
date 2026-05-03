---
name: discord-feature-command-scaffold
description: "Scaffold a new discord.js slash command for this repo. Use when creating a new command file, especially in commands/feature, matching the existing module.exports + SlashCommandBuilder pattern, adding subcommands, placeholders, optional helper imports, and the follow-up notes needed to wire long-running commands into index.js."
argument-hint: "Describe the command name, purpose, subcommands, options, and whether you want scaffold only or simple implementation stubs."
user-invocable: true
disable-model-invocation: false
---

# Discord Feature Command Scaffold

Create a new discord.js command file for this repository, usually in `commands/feature`, using the same structure and conventions as the existing commands.

Default outcome:

- Create a new file in `commands/feature/<command-name>.js`
- Export `data` and `execute`
- Use `SlashCommandBuilder`
- Add subcommands and placeholder execution branches when requested
- Include optional implementation stubs when the prompt asks for some logic but not a full feature
- Call out any required follow-up edits such as adding the command name to `long_commands` or `setup_required` in `index.js`

## When To Use

Use this skill when the task is any of the following:

- Create a new slash command file
- Scaffold a new feature command
- Add a command with subcommands
- Make a discord.js command template for this bot
- Lay groundwork for a new command without fully implementing it
- Start a command in `commands/feature` with placeholders and TODO sections

## Repository Conventions

Follow these rules for this codebase:

- Default location is `commands/feature` unless the user specifies a different folder
- Command files use CommonJS and export an object with `data` and `execute`
- `data` is built with `SlashCommandBuilder`
- `execute(interaction)` contains the command logic and handles subcommand branching when relevant
- Commands are auto-loaded from the `commands/*` folders, so no registration file edit is needed for a new command file alone
- Long-running commands may need to be added to `long_commands` in `index.js`
- Commands that require a guild/server config may need to be added to `setup_required` in `index.js`
- Match the surrounding repo style rather than introducing a new architecture

See [command template](./assets/feature-command.template.js.md) for the default scaffold shape.

## Procedure

1. Read the request and extract:
   - command name
   - destination folder, defaulting to `commands/feature`
   - primary purpose
   - whether subcommands are needed
   - command options for each subcommand
   - whether the user wants scaffold only or light implementation stubs

2. Inspect nearby command files in the same folder before generating code.
   - Prefer matching import style, error handling style, and naming patterns already used there
   - If the folder has mixed patterns, prefer the most common current pattern over the oldest one

3. Decide the command shape.
   - No subcommands: create a single-command builder with options directly on the command
   - Multiple actions: create subcommands with one execution branch per subcommand
   - Ambiguous action set: create a `help` subcommand only if the prompt or surrounding commands justify it

4. Build the scaffold.
   - Add `SlashCommandBuilder`
   - Add only the imports the scaffold actually needs
   - Create descriptive option names and descriptions
   - Add placeholder logic for unfinished branches using explicit TODO markers or a temporary reply
   - Keep the module valid and executable even if the implementation is incomplete

5. Add optional implementation stubs when requested.
   - Include basic validation
   - Include helper imports only if there is a clear intended integration point
   - Use safe, minimal behavior such as acknowledging the command or echoing parsed inputs
   - Do not fabricate complex helpers, database code, or network integrations that do not already exist

6. Check for follow-up integration notes.
   - If the command may exceed 3 seconds, mention `long_commands` in `index.js`
   - If the command requires guild config, mention `setup_required` in `index.js`
   - If deployment is needed, mention `node scripts/deploy-commands.js`

7. Validate the result.
   - The file exports `data` and `execute`
   - The command name matches the filename and slash command name unless the user requested otherwise
   - Every defined subcommand has a matching execution branch
   - Placeholder paths still reply to the interaction
   - The scaffold is syntactically valid JavaScript for Node and discord.js v14

## Decision Points

### Folder selection

- Use `commands/feature` by default
- Switch folders only when the user explicitly asks or the command clearly belongs elsewhere

### Subcommands vs direct options

- Use subcommands when the command represents multiple actions such as create, list, remove, or help
- Use direct options when the command performs one action only

### Placeholder vs partial implementation

- Use placeholders when requirements are incomplete or the user asked for a template
- Add partial implementation only for simple parsing, validation, or acknowledgement logic

### Helper imports

- Reuse existing helpers when the intended feature clearly maps to them
- Otherwise leave TODO markers rather than inventing new helpers

## Quality Bar

The scaffold is complete when all of the following are true:

- It matches the command style already used in this repository
- It is runnable as a command module without syntax errors
- It gives the next implementer a clear place to fill in business logic
- It does not overbuild features that were not requested
- It highlights any required follow-up edits outside the command file

## Output Guidance

When using this skill, produce:

- the command file
- a short note listing any follow-up wiring or deployment steps
- a short note calling out unresolved placeholders if the command is only partially implemented

## Example Prompts

- Create a new feature command called `vt` with subcommands `start`, `stop`, and `status`, scaffold only.
- Add a `quotes` command in `commands/feature` with subcommands `add`, `random`, and `remove`, plus simple validation stubs.
- Scaffold a `raid` command with `create` and `cancel` subcommands and placeholder helper imports for future database work.
