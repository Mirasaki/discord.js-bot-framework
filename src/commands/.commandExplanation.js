exports.run = async ({ client, message, args, guildSettings }) => {
    
    // .js files/commands starting with '.' WONT be loaded, like this template

    /*  exports.config {
        enabled: Is the command enabled globally?
        required: Can the command be disabled per server? Will check permission level accordingly
        aliases: Names/strings the command can also be called by
        permLevel: The permission level NAME required to execute the command
        cooldown: The cooldown between member calls. -1 to disable, 0 works, but it will still apply the 0 second cooldown
        clientPermissions: The permissions the client needs to execute the command
        userPermissions: The EXTRA discord permissions members need individually. Useful for moderation commands
    }

    

    exports.help {
        name: The name of the command

        category: The category of the command, commands will be separated/sorted
        by category in the "help" command

        shortDescription: A short description of the command

        longDescription: A long description of the command, only displayed when someone
        calls "help <command>". Provide a detailed description of what the command does and how to use it

        usage: Display how members/humans should be using the command
        <command> gets replaced by the respective command name in help

        examples: Provide some example of how to use the command 
        Think of required/available arguments/parametes/user input
        Try and show as much variety as possible
        The first example will be shown if a member calls "help <command>"
    }
    
    



    exports.args {
        // the index of the argument, 0 is the first user argument provided
        index: 0,
        name: '',
        // Available options
        options: [],
        // Are the options hard-set/coded or do they vary, like an ID
        flexible: true
    }
    */

};

exports.config = {
    enabled: Boolean,
    required: Boolean,
    aliases: Array,
    permLevel: String,
    cooldown: Number,
    clientPermissions: Array,
    userPermissions: Array
};

exports.help = {
    name: String,
    category: String,
    shortDescription: String,
    longDescription: String,
    usage: String,
    examples: Array
};

// Define required, optional and flags as empty arrays if
// none apply in this command
exports.args = {
    required: Array,
    optional: Array,
    flags: Array
};

// Complete example
exports.args = {
    required: [
        {
            index: 0,
            name: '',
            options: [],
            flexible: true
        }
    ],
    optional: [
        {
            index: 1,
            name: '',
            options: [],
            flexible: true
        }
    ],
    // Flags can be provided when calling a command,
    // all user arguments starting with "--" are read as command flags
    // and stored in args.flags in the message event
    flags: [
        {
            flag: 'test',
            result: 'Calling this command flag will **do this**',
            permLevel: 'Same usage as config.permLevel',
            permissions: []
        }
    ]
};
