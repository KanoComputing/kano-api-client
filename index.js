import { Client } from './lib/client.js';
import { AccountClient } from './lib/account.js';
import { UserClient } from './lib/user.js';
import { ShareClient } from './lib/share.js';
import { CommentClient } from './lib/comment.js';
import { GamificationClient } from './lib/gamification.js';
import { PingClient } from './lib/ping.js';

import { ResponseCache } from './lib/response-cache.js';

import { GamificationFallbackPlugin } from './plugins/gamification-fallback.js';

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
