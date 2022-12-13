#!/usr/bin/env node

import { publish } from 'gh-pages';

publish(
    'public',
    {
        branch: 'gh-pages',
        silent: true,
        repo: 'https://' + process.env.GITHUB_TOKEN + '@github.com/DrZlo13/zero_tracker_js.git',
        user: {
            name: 'DrZlo13',
            email: 'who.just.the.doctor@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)