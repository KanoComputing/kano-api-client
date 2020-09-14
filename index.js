import { Client } from './lib/client.js';
import { AccountClient } from './lib/account.js';
import { ActivityClient } from './lib/activity.js';
import { AdminClient } from './lib/admin.js';
import { UserClient } from './lib/user.js';
import { ShareClient } from './lib/share.js';
import { TaskClient } from './lib/task.js';
import { CommentClient } from './lib/comment.js';
import { GamificationClient } from './lib/gamification.js';
import { PingClient } from './lib/ping.js';

import { ResponseCache } from './lib/response-cache.js';

// REMOVED: due to GamificationFallbackPlugin importing the whole gamification bundle
// import { GamificationFallbackPlugin } from './plugins/gamification-fallback.js';

class GamificationFallbackPlugin {
    constructor() {
        throw new Error('Import GamificationFallbackPlugin from root file "./plugins/gamification-fallback.js"');
    }
}

export {
    Client,
    AccountClient,
    ActivityClient,
    AdminClient,
    UserClient,
    ShareClient,
    TaskClient,
    CommentClient,
    GamificationClient,
    PingClient,
    GamificationFallbackPlugin,
    ResponseCache,
};

export default {
    Client,
    AccountClient,
    ActivityClient,
    AdminClient,
    UserClient,
    ShareClient,
    TaskClient,
    CommentClient,
    GamificationClient,
    PingClient,
    GamificationFallbackPlugin,
    ResponseCache,
};
