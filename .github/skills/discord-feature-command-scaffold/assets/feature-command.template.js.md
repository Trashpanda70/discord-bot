# Feature Command Template

Use this as a starting point for new files in `commands/feature`.

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('{{commandName}}')
    .setDescription('{{commandDescription}}')
    .addSubcommand(subcommand =>
      subcommand
        .setName('{{subcommandOneName}}')
        .setDescription('{{subcommandOneDescription}}')
        .addStringOption(option =>
          option
            .setName('{{optionName}}')
            .setDescription('{{optionDescription}}')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('{{subcommandTwoName}}')
        .setDescription('{{subcommandTwoDescription}}')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand(false);

      if (subcommand === '{{subcommandOneName}}') {
        const value = interaction.options.getString('{{optionName}}');

        // TODO: Implement {{subcommandOneName}}.
        return await interaction.reply(`TODO: handle {{commandName}} ${subcommand} with ${value}`);
      }

      if (subcommand === '{{subcommandTwoName}}') {
        // TODO: Implement {{subcommandTwoName}}.
        return await interaction.reply('TODO: implement this subcommand.');
      }

      return await interaction.reply("I'm sorry, I do not recognize that subcommand.");
    } catch (error) {
      console.error(error);
      return await interaction.reply('There was an error executing this command.');
    }
  },
};
```

## Adaptation Notes

- Remove subcommands entirely when the command only performs one action.
- Replace `interaction.reply` with `interaction.editReply` if the command will be deferred.
- Add repo-specific imports only when they are actually used.
- Keep placeholder replies valid so unfinished scaffolds still run.