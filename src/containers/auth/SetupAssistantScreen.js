/* eslint-disable no-await-in-loop */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import { RouterStore } from 'mobx-react-router';
import {
  DEFAULT_TODO_RECIPE_ID,
  DEFAULT_TODO_SERVICE_NAME,
} from '../../config';
import { sleep } from '../../helpers/async-helpers';
import SetupAssistant from '../../components/auth/SetupAssistant';
import ServicesStore from '../../stores/ServicesStore';
import RecipesStore from '../../stores/RecipesStore';
import UserStore from '../../stores/UserStore';

export default
@inject('stores', 'actions')
@observer
class SetupAssistantScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSettingUpServices: false,
    };
  }

  // TODO: Why are these hardcoded here? Do they need to conform to specific services in the packaged recipes? If so, its more important to fix this
  services = {
    whatsapp: {
      name: 'WhatsApp',
      hasTeamId: false,
    },
    messenger: {
      name: 'Messenger',
      hasTeamId: false,
    },
    gmail: {
      name: 'Gmail',
      hasTeamId: false,
    },
    skype: {
      name: 'Skype',
      hasTeamId: false,
    },
    telegram: {
      name: 'Telegram',
      hasTeamId: false,
    },
    instagram: {
      name: 'Instagram',
      hasTeamId: false,
    },
    slack: {
      name: 'Slack',
      hasTeamId: true,
    },
    hangouts: {
      name: 'Hangouts',
      hasTeamId: false,
    },
    linkedin: {
      name: 'LinkedIn',
      hasTeamId: false,
    },
  };

  async setupServices(serviceConfig) {
    const {
      stores: { services },
    } = this.props;

    this.setState({
      isSettingUpServices: true,
    });

    // The store requests are not build for parallel requests so we need to finish one request after another
    for (const config of serviceConfig) {
      const serviceData = {
        name: this.services[config.id].name,
      };

      if (config.team) {
        serviceData.team = config.team;
      }

      await services._createService({
        recipeId: config.id,
        serviceData,
        redirect: false,
        skipCleanup: true,
      });

      await sleep(100);
    }

    // Add todo service
    await services._createService({
      recipeId: DEFAULT_TODO_RECIPE_ID,
      serviceData: {
        name: DEFAULT_TODO_SERVICE_NAME,
      },
      redirect: false,
      skipCleanup: true,
    });

    this.setState({
      isSettingUpServices: false,
    });
  }

  render() {
    return (
      <SetupAssistant
        onSubmit={config => this.setupServices(config)}
        services={this.services}
        embed={false}
        isSettingUpServices={this.state.isSettingUpServices}
      />
    );
  }
}

SetupAssistantScreen.wrappedComponent.propTypes = {
  stores: PropTypes.shape({
    services: PropTypes.instanceOf(ServicesStore),
    router: PropTypes.instanceOf(RouterStore).isRequired,
    recipes: PropTypes.instanceOf(RecipesStore),
    user: PropTypes.instanceOf(UserStore),
  }).isRequired,
  actions: PropTypes.shape({
    user: PropTypes.instanceOf(UserStore).isRequired,
    service: PropTypes.instanceOf(ServicesStore).isRequired,
    recipe: PropTypes.instanceOf(RecipesStore).isRequired,
  }).isRequired,
};
