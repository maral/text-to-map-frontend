import MapPage from "@/components/MapPage/MapPage";
import { DataForMap } from "@/types/data";
import {
  checkSchoolRedirects,
  getSchoolData,
  getSchoolSlugsList,
} from "@/utils/dataCache";
import { GetStaticPaths, GetStaticProps } from "next";

const SchoolPage = ({ data }: SchoolPageProps) => {
  return <MapPage data={data} />;
};
SchoolPage.displayName = "SchoolPage";

export default SchoolPage;

interface SchoolPageProps {
  data: DataForMap;
}

export const getStaticProps: GetStaticProps<SchoolPageProps> = async (
  context
) => {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const schoolSlug = context.params.school as string;
  const data = await getSchoolData(schoolSlug);
  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await checkSchoolRedirects();

  // A school serving several municipalities is listed in each of them.
  const schools = new Set(await getSchoolSlugsList());

  const paths = Array.from(schools).map((school: string) => ({
    params: { school },
  }));

  return { paths, fallback: false };
};
