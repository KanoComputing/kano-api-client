import { Client } from './lib/client.js';
import { AccountClient } from './lib/account.js';
import { UserClient } from './lib/user.js';
import { ShareClient } from './lib/share.js';
import { CommentClient } from './lib/comment.js';
import { GamificationClient } from './lib/gamification.js';
import { PingClient } from './lib/ping.js';

import { ResponseCache } from './lib/response-cache.js';

// REMOVED: due to GamificationFallbackPlugin importing the whole gamification bundle
// import { GamificationFallbackPlugin } from './plugins/gamification-fallback.js';

// IDEA: create fake instance to throw error anywhere we are importing GamificationFallbackPlugin
class GamificationFallbackPlugin {
    constructor() {
        throw new Error('Import GamificationFallbackPlugin from root file "./plugins/gamification-fallback.js"');
    }
}

export {
    Client,
    AccountClient,
    UserClient,
    ShareClient,
    CommentClient,
    GamificationClient,
    PingClient,
    GamificationFallbackPlugin,
    ResponseCache,
};

export default {
    Client,
    AccountClient,
    UserClient,
    ShareClient,
    CommentClient,
    GamificationClient,
    PingClient,
    GamificationFallbackPlugin,
    ResponseCache,
};
