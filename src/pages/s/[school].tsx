import MapPage from "@/components/MapPage/MapPage";
import { DataForMap } from "@/types/data";
import { getSchoolData, getSchoolSlugsList } from "@/utils/dataCache";
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

  try {
    const schoolSlug = context.params.school as string;
    return {
      props: {
        data: getSchoolData(schoolSlug),
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const schools = getSchoolSlugsList(2024);

  const paths = schools.map((school: string) => ({
    params: { school },
  }));

  return { paths, fallback: false };
};
