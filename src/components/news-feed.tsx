import * as React from 'react';
import gql from 'graphql-tag';

import { NewsTitleWithData } from '../container/news-title-with-data';
import { NewsTitleView } from './news-title';
import { NewsDetail } from '../presentational/news-detail';
import { NewsDetailView } from '../presentational/news-detail';
import { NewsItem } from '../data/models';
import { LoadingSpinner } from '../presentational/loading-spinner';

export interface INewsFeedProps {
  isPostScrutinyVisible?: boolean;
  first: number;
  newsItems: NewsItem[];
  notice: JSX.Element[];
  skip: number;
  isJobListing?: boolean;
  isRankVisible?: boolean;
  isUpvoteVisible?: boolean;
  currentUrl: string;
}

export class NewsFeedView extends React.Component<INewsFeedProps> {
  static fragments = {
    newsItem: gql`
      fragment NewsFeed on NewsItem {
        id
        hidden
        ...NewsTitle
        ...NewsDetail
      }
      ${NewsTitleView.fragments.newsItem}
      ${NewsDetailView.fragments.newsItem}
    `,
  };

  static defaultProps = {
    isPostScrutinyVisible: false,
    isJobListing: false,
    isRankVisible: true,
    isUpvoteVisible: true,
    notice: null,
  };

  render() {
    const props = this.props;

    const nextPage = Math.ceil((props.skip || 1) / props.first) + 1;

    const rows = [];
    if (props.notice) rows.push(...props.notice);
    props.newsItems.forEach((newsItem, index) => {
      if (!newsItem.hidden) {
        rows.push(
          <NewsTitleWithData
            key={`${newsItem.id.toString()}title`}
            isRankVisible={props.isRankVisible}
            isUpvoteVisible={props.isUpvoteVisible}
            rank={props.skip + index + 1}
            {...newsItem}
          />
        );
        rows.push(
          <NewsDetail
            key={`${newsItem.id.toString()}detail`}
            isFavoriteVisible={false}
            isPostScrutinyVisible={props.isPostScrutinyVisible}
            isJobListing={props.isJobListing}
            {...newsItem}
          />
        );
        rows.push(<tr className="spacer" key={`${newsItem.id.toString()}spacer`} style={{ height: 5 }} />);
      }
    });
    rows.push(<tr key="morespace" className="morespace" style={{ height: '10px' }} />);
    rows.push(
      <tr key="morelinktr">
        <td key="morelinkcolspan" colSpan={2} />
        <td key="morelinktd" className="title">
          <a key="morelink" href={`${props.currentUrl}?p=${nextPage}`} className="morelink" rel="nofollow">
            More
          </a>
        </td>
      </tr>
    );

    return (
      <tr>
        <td style={{ padding: '0px' }}>
          <table
            style={{ border: '0px', padding: '0px', borderCollapse: 'collapse', borderSpacing: '0px' }}
            className="itemlist"
          >
            <tbody>{rows}</tbody>
          </table>
        </td>
      </tr>
    );
  }
}

export const NewsFeed = ({ data: { loading, error, feed }, data, options }) => {
  if (error)
    return (
      <tr>
        <td>Error loading news items.</td>
      </tr>
    );
  if (feed && feed.length) return <NewsFeedView newsItems={feed} {...options} />;
  return <LoadingSpinner />;
};